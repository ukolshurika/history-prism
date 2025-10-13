# frozen_string_literal: true

class EventsController < ApplicationController
  before_action :set_event, only: [:show, :edit, :update, :destroy]

  def index
    @events = Event.includes(:user).order(start_date: :desc)

    render inertia: 'Events/Index', props: {
      events: @events.map { |event| event_json(event) },
      current_user: current_user
    }
  end

  def show
    authorize @event

    render inertia: 'Events/Show', props: {
      event: event_json(@event),
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
        category: 'person'
      },
      categories: Event.categories.keys,
      isEdit: false
    }
  end

  def edit
    authorize @event

    render inertia: 'Events/Form', props: {
      event: event_json(@event),
      categories: Event.categories.keys,
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
        event: event_json(@event),
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
    params.require(:event).permit(:title, :description, :start_date, :end_date, :category, person_ids: [])
  end

  def event_json(event)
    {
      id: event.id,
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      category: event.category,
      creator: {
        id: event.user.id,
        email: event.user.email
      },
      created_at: event.created_at,
      updated_at: event.updated_at
    }
  end
end