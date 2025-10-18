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
    @event = Current.user.events.build(event_params)
    authorize @event

    if @event.save
      redirect_to event_path(@event), notice: 'Event was successfully created.'
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
    params.require(:event).permit(:title, :description, :start_date, :end_date, :category, person_ids: [], people_attributes: [:id, :first_name, :middle_name, :last_name, :gedcom_uuid, :_destroy])
  end
end