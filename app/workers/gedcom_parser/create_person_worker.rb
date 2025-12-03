# frozen_string_literal: true

module GedcomParser
  class CreatePersonWorker
    include Sidekiq::Worker

    def perform(file_id, key, person_id, user_id)
      response = GedcomParserApi.person(key, person_id)
      Gedcom::CreatePerson.new(response, file_id, user_id).call
    end
  end
end
