# frozen_string_literal: true

class TimelinesController < ApplicationController
  before_action :set_timeline, only: [:show, :edit, :update, :destroy]

  def index
    @timelines = policy_scope(Timeline).includes(:person).order(created_at: :desc)

    render inertia: 'Timelines/Index', props: {
      timelines: ActiveModelSerializers::SerializableResource.new(@timelines, each_serializer: TimelineSerializer).as_json,
      current_user: current_user
    }
  end

  def show
    authorize @timeline

    render inertia: 'Timelines/Show', props: {
      timeline: TimelineSerializer.new(@timeline).as_json,
      can_edit: policy(@timeline).update?,
      can_delete: policy(@timeline).destroy?
    }
  end

  def new
    @timeline = Current.user.timelines.build
    authorize @timeline

    render inertia: 'Timelines/Form', props: {
      timeline: {
        title: '',
        person_id: nil,
        visible: false
      },
      people: available_people,
      isEdit: false
    }
  end

  def create
    @timeline = Current.user.timelines.build(timeline_params)
    authorize @timeline

    if @timeline.save
      TimelineWorker.perform_async(@timeline.id, current_user.id)
      redirect_to timelines_path, notice: 'Timeline was successfully created and is being processed.'
    else
      render inertia: 'Timelines/Form', props: {
        timeline: @timeline.as_json,
        people: available_people,
        errors: @timeline.errors.full_messages,
        isEdit: false
      }
    end
  end

  def edit
    authorize @timeline

    render inertia: 'Timelines/Form', props: {
      timeline: TimelineSerializer.new(@timeline).as_json,
      people: available_people,
      isEdit: true
    }
  end

  def update
    authorize @timeline

    if @timeline.update(timeline_update_params)
      redirect_to timeline_path(@timeline), notice: 'Timeline was successfully updated.'
    else
      render inertia: 'Timelines/Form', props: {
        timeline: @timeline.as_json,
        people: available_people,
        errors: @timeline.errors.full_messages,
        isEdit: true
      }
    end
  end

  def destroy
    authorize @timeline
    @timeline.destroy

    redirect_to timelines_path, notice: 'Timeline was successfully deleted.'
  end

  private

  def set_timeline
    @timeline = Timeline.find(params[:id])
  end

  def timeline_params
    params.require(:timeline).permit(:title, :person_id, :visible)
  end

  def timeline_update_params
    params.require(:timeline).permit(:title, :visible)
  end

  def available_people
    Current.user.people.order(:first_name, :last_name).map do |person|
      {
        id: person.id,
        name: person.name || "#{person.first_name} #{person.last_name}".strip
      }
    end
  end
end
