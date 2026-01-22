# frozen_string_literal: true

module Gedcom
  class CreatePersonWorker
    include Sidekiq::Worker

    VITAL_EVENTS = %w[Birth Death].freeze

    def perform(file_id, key, person_id, user_id)
      response = GedcomApi.person(key, person_id)
      person = Gedcom::CreatePerson.new(response, file_id, user_id).call

      create_vital_events(key, person_id, person, user_id, file_id)
    end

    private

    def create_vital_events(key, person_id, person, user_id, file_id)
      timeline_events = GedcomApi.timeline(key, person_id)

      vital_events = timeline_events.select { |e| VITAL_EVENTS.include?(e.name) }

      vital_events.each do |event|
        Gedcom::CreateEvent.new(event, person, user_id, file_id).call
      end
    end
  end
end
