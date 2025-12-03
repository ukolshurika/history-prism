# frozen_string_literal: true

module GedcomParser
  class UploadWorker
    include Sidekiq::Worker

    def perform(file_id, user_id)
      key = GedcomFile.find(file_id).file.attachment.key
      response = GedcomParserApi.people(key)
      response['persons'].each { |p_id| CreatePersonWorker.perform_async(file_id, key, p_id, user_id) }
    end
  end
end
