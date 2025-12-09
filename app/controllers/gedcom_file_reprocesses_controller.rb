# frozen_string_literal: true

class GedcomFileReprocessesController < ApplicationController
  def create
    @gedcom_file = GedcomFile.find(params[:gedcom_file_id])
    authorize @gedcom_file, policy_class: GedcomFileReprocessPolicy

    GedcomParser::UploadWorker.perform_async(@gedcom_file.id, current_user.id)

    redirect_to gedcom_files_path, notice: 'GEDCOM file reprocessing has been started.'
  end
end
