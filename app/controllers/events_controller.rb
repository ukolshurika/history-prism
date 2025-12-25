# frozen_string_literal: true

class EventsController < ApplicationController
  before_action :set_event, only: [:show, :edit, :update, :destroy]

  def index
    @events = Event.includes(:creator).order(start_date: :desc)

    render inertia: 'Events/Index', props: {
      events: ActiveModelSerializers::SerializableResource.new(@events, each_serializer: EventSerializer).as_json,
      current_user: current_user
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

    # Create FuzzyDate records from nested attributes
    if params[:event][:start_date_attributes].present?
      start_attrs = params[:event][:start_date_attributes]
      if start_attrs[:year].present?
        start_fuzzy_date = create_fuzzy_date_from_attributes(start_attrs)
        @event.start_date = start_fuzzy_date
      end
    end

    if params[:event][:end_date_attributes].present?
      end_attrs = params[:event][:end_date_attributes]
      if end_attrs[:year].present?
        end_fuzzy_date = create_fuzzy_date_from_attributes(end_attrs)
        @event.end_date = end_fuzzy_date
      end
    end

    # Set other attributes
    @event.title = params[:event][:title]
    @event.description = params[:event][:description]
    @event.category = params[:event][:category]

    if @event.save
      # If timeline_id is provided, associate the event with the timeline
      if params[:event][:timeline_id].present?
        timeline = Timeline.find(params[:event][:timeline_id])
        category_key = @event.category.to_s

        # Update cached_events_for_display
        current_events = timeline.cached_events_for_display[category_key] || []
        timeline.update(
          cached_events_for_display: timeline.cached_events_for_display.merge(
            category_key => (current_events + [@event.id]).uniq
          )
        )

        redirect_to timeline_path(timeline), notice: 'Event was successfully created.'
      else
        redirect_to event_path(@event), notice: 'Event was successfully created.'
      end
    else
      render inertia: 'Events/Form', props: {
        event: event_params,
        categories: Event.categories.keys,
        errors: @event.errors.full_messages,
        isEdit: false
      }
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
      end_date_attributes: [:date_type, :year, :month, :day, :calendar_type]
    )
  end

  def create_fuzzy_date_from_attributes(attrs)
    # Build original_text from the date components
    date_parts = []
    date_parts << attrs[:year] if attrs[:year].present?
    date_parts << attrs[:month].to_s.rjust(2, '0') if attrs[:month].present?
    date_parts << attrs[:day].to_s.rjust(2, '0') if attrs[:day].present?
    original_text = date_parts.join('-')

    FuzzyDate.create!(
      original_text: original_text,
      year: attrs[:year].present? ? attrs[:year].to_i : nil,
      month: attrs[:month].present? ? attrs[:month].to_i : nil,
      day: attrs[:day].present? ? attrs[:day].to_i : nil,
      date_type: attrs[:date_type] || 'exact',
      calendar_type: attrs[:calendar_type] || 'gregorian'
    )
  end
end