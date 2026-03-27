# frozen_string_literal: true

module Gedcom
  class UploadWorker
    include Sidekiq::Worker
    include WorkerErrorHandling

    def perform(file_id, user_id)
      with_worker_error_handling(file_id: file_id, user_id: user_id) do
        key = GedcomFile.find(file_id).file.attachment.key
        response = GedcomApi.people(key)
        response['persons'].each { |p_id| CreatePersonWorker.perform_async(file_id, key, p_id.gsub('@', ''), user_id) }
      end
    end
  end
end
