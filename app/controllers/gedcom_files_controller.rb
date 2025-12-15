# frozen_string_literal: true

class GedcomFilesController < ApplicationController
  def index
    @gedcom_files = Current.user.gedcom_files.order(created_at: :desc)

    render inertia: 'GedcomFiles/Index', props: {
      gedcom_files: ActiveModelSerializers::SerializableResource.new(@gedcom_files, each_serializer: GedcomFileSerializer).as_json,
      current_user: current_user
    }
  end

  def create
    @gedcom_file = Current.user.gedcom_files.build(gedcom_file_params)
    authorize @gedcom_file

    if @gedcom_file.save
      Gedcom::UploadWorker.perform_async(@gedcom_file.id, current_user.id)
      redirect_to gedcom_files_path, notice: 'GEDCOM file was successfully uploaded.'
    else
      render inertia: 'GedcomFiles/Index', props: {
        gedcom_files: ActiveModelSerializers::SerializableResource.new(Current.user.gedcom_files, each_serializer: GedcomFileSerializer).as_json,
        current_user: current_user,
        errors: @gedcom_file.errors.full_messages
      }
    end
  end

  private

  def gedcom_file_params
    params.permit(:file)
  end
end
