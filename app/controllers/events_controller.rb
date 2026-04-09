# frozen_string_literal: true

class EventsController < ApplicationController
  include Paginatable

  before_action :set_event, only: [:show, :edit, :update, :destroy]

  def index
    respond_to do |format|
      format.html do
        redirect_to timelines_path
      end

      format.json do
        events = build_index_scope

        render json: {
          events: serialized_events(events),
          meta: pagination_meta(events)
        }
      end
    end
  end

  def show
    authorize @event

    render inertia: 'Events/Show', props: {
      event: EventSerializer.new(@event).as_json,
      can_edit: policy(@event).update?,
      can_delete: policy(@event).destroy?
    }
  end

  def new
    @event = Event.new
    authorize @event

    render inertia: 'Events/Form', props: {
      event: {
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        category: 'person',
        person_ids: []
      },
      categories: Event.categories.keys,
      # people: ActiveModelSerializers::SerializableResource.new(People, each_serializer: PersonSerializer).as_json,
      isEdit: false
    }
  end

  def edit
    authorize @event

    render inertia: 'Events/Form', props: {
      event: EventSerializer.new(@event).as_json,
      categories: Event.categories.keys,
      # people: ActiveModelSerializers::SerializableResource.new(Current.user.people, each_serializer: PersonSerializer).as_json,
      isEdit: true
    }
  end

  def create
    @event = Current.user.events.build
    authorize @event

    result = Events::CreateService.new(user: Current.user, params: event_params).call
    @event = result.event

    if result.timeline
      redirect_to timeline_path(result.timeline), notice: 'Event was successfully created.'
    else
      redirect_to event_path(@event), notice: 'Event was successfully created.'
    end
  rescue ActiveRecord::RecordInvalid => e
    @event = e.record if e.record.is_a?(Event)

    if @event
      render inertia: 'Events/Form', props: {
        event: event_params,
        categories: Event.categories.keys,
        errors: @event.errors.full_messages,
        isEdit: false
      }
    else
      raise
    end
  end

  def update
    authorize @event

    attrs = event_params.to_h.deep_symbolize_keys
    @event.assign_attributes(base_event_attributes(attrs))
    assign_fuzzy_date(@event, :start_date, attrs[:start_date_attributes])
    assign_fuzzy_date(@event, :end_date, attrs[:end_date_attributes])

    if @event.save
      redirect_to event_path(@event), notice: 'Event was successfully updated.'
    else
      render inertia: 'Events/Form', props: {
        event: EventSerializer.new(@event).as_json,
        categories: Event.categories.keys,
        errors: @event.errors.full_messages,
        isEdit: true
      }
    end
  end

  def destroy
    authorize @event
    @event.destroy

    redirect_to timelines_path, notice: 'Event was successfully deleted.'
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    permitted = params.require(:event).permit(
      :title, :description, :start_date, :end_date, :category, :timeline_id,
      person_ids: [],
      people_attributes: [:id, :first_name, :middle_name, :last_name, :gedcom_uuid, :_destroy],
      start_date_attributes: [:original_text, :date_type, :year, :month, :day, :year_end, :month_end, :day_end, :calendar_type],
      end_date_attributes: [:original_text, :date_type, :year, :month, :day, :year_end, :month_end, :day_end, :calendar_type],
      location_attributes: [:id, :place, :latitude, :longitude]
    )

    normalize_string_date!(permitted, :start_date)
    normalize_string_date!(permitted, :end_date)

    permitted.except(:start_date, :end_date)
  end

  def base_event_attributes(attrs)
    attrs.except(:start_date_attributes, :end_date_attributes, :timeline_id)
  end

  def assign_fuzzy_date(event, association_name, attrs)
    fuzzy_date = FuzzyDate.find_or_create_from_attrs!(attrs)
    event.public_send("#{association_name}=", fuzzy_date)
  end

  def normalize_string_date!(permitted, field_name)
    value = permitted[field_name]
    return if value.blank? || permitted["#{field_name}_attributes"].present?

    date = parse_form_date(value)
    return unless date

    permitted["#{field_name}_attributes"] = {
      year: date.year.to_s,
      month: date.month.to_s,
      day: date.day.to_s,
      date_type: 'exact',
      calendar_type: 'gregorian'
    }
  end

  def parse_form_date(value)
    return value.to_date if value.respond_to?(:to_date)

    Date.iso8601(value.to_s)
  rescue ArgumentError, TypeError
    nil
  end

  def build_index_scope
    scope = policy_scope(Event).includes(:creator, :source, :start_date, :location)
    scope = Events::IndexQuery.new(scope: scope, params: params).call
    paginate(scope)
  end

  def serialized_events(collection)
    ActiveModelSerializers::SerializableResource.new(collection, each_serializer: EventSerializer).as_json
  end
end
