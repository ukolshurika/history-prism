# frozen_string_literal: true

module Gedcom
  class UploadWorker
    include Sidekiq::Worker

    def perform(file_id, user_id)
      gedcom_file = GedcomFile.find(file_id)
      gedcom_file.update!(processing_status: 'processing', processing_error: nil)

      key = gedcom_file.file.attachment.key
      response = GedcomApi.people(key)
      response['persons'].each { |p_id| CreatePersonWorker.perform_async(file_id, key, p_id.gsub('@', ''), user_id) }
      gedcom_file.update!(processing_status: 'completed', processing_error: nil)
    rescue StandardError => e
      gedcom_file&.update_columns(processing_status: 'failed', processing_error: e.message)
      raise
    end
  end
end
