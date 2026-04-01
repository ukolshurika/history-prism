# frozen_string_literal: true

class EventsController < ApplicationController
  include Paginatable

  before_action :set_event, only: [:show, :edit, :update, :destroy]

  def index
    @events = Event.includes(:creator, :source, :start_date, :location)
    @events = apply_source_filters(@events)
    @events = apply_search(@events)
    @events = apply_sort(@events)
    @events = paginate(@events)

    render inertia: 'Events/Index', props: {
      events: ActiveModelSerializers::SerializableResource.new(@events, each_serializer: EventSerializer).as_json,
      current_user: current_user,
      meta: pagination_meta(@events),
      filters: {
        source_type: params[:source_type],
        source_id:   params[:source_id],
        q:           params[:q],
        sort:        params[:sort],
        direction:   params[:direction]
      }
    }
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

    if @event.update(event_params)
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

    redirect_to events_path, notice: 'Event was successfully deleted.'
  end

  private

  def set_event
    @event = Event.find(params[:id])
  end

  def event_params
    params.require(:event).permit(
      :title, :description, :start_date, :end_date, :category, :timeline_id,
      person_ids: [],
      people_attributes: [:id, :first_name, :middle_name, :last_name, :gedcom_uuid, :_destroy],
      start_date_attributes: [:date_type, :year, :month, :day, :calendar_type],
      end_date_attributes: [:date_type, :year, :month, :day, :calendar_type],
      location_attributes: [:id, :place, :latitude, :longitude]
    )
  end

  def apply_search(scope)
    return scope unless params[:q].present?

    scope.search_full_text(params[:q])
  end

  def apply_sort(scope)
    case params[:sort]
    when 'date'
      scope.sorted_by_date(params[:direction])
    when 'place'
      scope.sorted_by_place(params[:direction])
    else
      scope.order(created_at: :desc)
    end
  end

  def apply_source_filters(scope)
    scope = scope.where(source_type: params[:source_type]) if params[:source_type].present?
    scope = scope.where(source_id: params[:source_id]) if params[:source_id].present?
    scope
  end
end
