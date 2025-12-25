# frozen_string_literal: true

class TimelinesController < ApplicationController
  before_action :set_timeline, only: %i(show edit update destroy export_pdf download_pdf)

  def index
    @timelines = policy_scope(Timeline).includes(:person).order(created_at: :desc)

    render inertia: 'Timelines/Index', props: {
      timelines: ActiveModelSerializers::SerializableResource.new(@timelines,
                                                                  each_serializer: TimelineSerializer).as_json,
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
        person_id: params[:person_id],
        visible: false
      },
      people: available_people,
      isEdit: false
    }
  end

  def edit
    authorize @timeline

    render inertia: 'Timelines/Form', props: {
      timeline: TimelineSerializer.new(@timeline).as_json,
      people: available_people,
      isEdit: true
    }
  end

  def create
    @timeline = Current.user.timelines.build(timeline_params)
    authorize @timeline

    if @timeline.save
      Gedcom::TimelineWorker.perform_async(@timeline.id, current_user.id)
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

  def export_pdf
    authorize @timeline

    TimelineWorkers::PdfGeneratorWorker.perform_async(@timeline.id)

    redirect_to timeline_path(@timeline),
      notice: 'PDF generation started. Please refresh the page in a few moments to see the download button.'
  end

  def download_pdf
    authorize @timeline

    if @timeline.pdf_url.blank?
      redirect_to timeline_path(@timeline), alert: 'PDF has not been generated yet.'
      return
    end

    pdf_path = Rails.root.join(@timeline.pdf_url.sub('/app/', ''))

    unless File.exist?(pdf_path)
      redirect_to timeline_path(@timeline), alert: 'PDF file not found. Please regenerate.'
      return
    end

    send_file pdf_path,
      filename: "timeline_#{@timeline.id}_#{@timeline.title.parameterize}.pdf",
      type: 'application/pdf',
      disposition: 'attachment'
  end

  private

  def set_timeline
    @timeline = Timeline.find(params[:id])
  end

  def timeline_params
    params.require(:timeline).permit(:title, :person_id, :visible)
  end

  def timeline_update_params
    params.require(:timeline).permit(:title, :visible, cached_events_for_display: {})
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
