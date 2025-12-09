# frozen_string_literal: true

class PeopleController < ApplicationController
  before_action :set_person, only: [:show, :edit, :update, :destroy]

  def index
    @q = Current.user.people.ransack(params[:q])
    @people = @q.result.includes(:events).order(first_name: :asc)
    @gedcom_files = Current.user.gedcom_files.order(created_at: :desc)

    render inertia: 'People/Index', props: {
      people: ActiveModelSerializers::SerializableResource.new(@people, each_serializer: PersonSerializer).as_json,
      gedcom_files: @gedcom_files.map { |gf| { id: gf.id, name: gf.file.filename.to_s } },
      current_user: current_user
    }
  end

  def show
    authorize @person

    render inertia: 'People/Show', props: {
      person: PersonSerializer.new(@person).as_json,
      can_edit: policy(@person).update?,
      can_delete: policy(@person).destroy?
    }
  end

  def new
    @person = Current.user.people.build
    authorize @person

    render inertia: 'People/Form', props: {
      person: {
        name: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        gedcom_uuid: '',
        event_ids: []
      },
      events: available_person_events,
      isEdit: false
    }
  end

  def edit
    authorize @person

    render inertia: 'People/Form', props: {
      person: PersonSerializer.new(@person).as_json,
      events: available_person_events,
      isEdit: true
    }
  end

  def create
    @person = Current.user.people.build(person_params)
    authorize @person

    if @person.save
      redirect_to person_path(@person), notice: 'Person was successfully created.'
    else
      render inertia: 'People/Form', props: {
        person: person_params,
        events: available_person_events,
        errors: @person.errors.full_messages,
        isEdit: false
      }
    end
  end

  def update
    authorize @person

    if @person.update(person_params)
      redirect_to person_path(@person), notice: 'Person was successfully updated.'
    else
      render inertia: 'People/Form', props: {
        person: PersonSerializer.new(@person).as_json,
        events: available_person_events,
        errors: @person.errors.full_messages,
        isEdit: true
      }
    end
  end

  def destroy
    authorize @person
    @person.destroy

    redirect_to people_path, notice: 'Person was successfully deleted.'
  end

  private

  def set_person
    @person = Current.user.people.find(params[:id])
  end

  def person_params
    params.require(:person).permit(:name, :first_name, :middle_name, :last_name, :gedcom_uuid, event_ids: [], events_attributes: [:id, :title, :description, :start_date, :end_date, :category, :_destroy])
  end

  def available_person_events
    # Only return person-type events belonging to the current user
    ActiveModelSerializers::SerializableResource.new(
      Current.user.events.where(category: :person),
      each_serializer: EventSerializer
    ).as_json
  end
end
