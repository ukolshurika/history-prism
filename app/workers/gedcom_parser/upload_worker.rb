# frozen_string_literal: true

module GedcomParser
  class UploadWorker
    include Sidekiq::Worker

    def perform(user_id, file_id)
      GedcomParserApi.get_events(GedcomFile.find(file_id).file.attachment.key, user_id)
    end
  end
end
