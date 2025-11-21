# frozen_string_literal: true

module GedcomParser
  class UploadWorker
    include Sidekiq::Worker

    def perform(file_id, user_id)
      GedcomParserApi.get_events(GedcomFile.find(file_id).file.attachment.key, user_id)
    end
  end
end
