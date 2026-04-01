# frozen_string_literal: true

module Gedcom
  class UploadWorker
    include Sidekiq::Worker
    include WorkerErrorHandling

    PERSON_BATCH_SIZE = 25

    def perform(file_id, user_id)
      gedcom_file = GedcomFile.find(file_id)
      gedcom_file.update!(processing_status: 'processing', processing_error: nil)

      with_worker_error_handling(file_id: file_id, user_id: user_id) do
        key = gedcom_file.file.attachment.key
        response = GedcomApi.people(key)
        normalize_person_ids(response['persons']).each_slice(PERSON_BATCH_SIZE) do |person_ids|
          CreatePersonWorker.perform_async(file_id, key, person_ids, user_id)
        end
        gedcom_file.update!(processing_status: 'completed', processing_error: nil)
      end
    rescue StandardError => e
      gedcom_file&.update_columns(processing_status: 'failed', processing_error: e.message)
      raise
    end

    private

    def normalize_person_ids(person_ids)
      Array(person_ids).map { |p_id| p_id.gsub('@', '') }
    end
  end
end
