# frozen_string_literal: true

module Gedcom
  class TimelineWorker
    include Sidekiq::Worker

    def perform(timeline_id, user_id)
      timeline = Timeline.find(timeline_id)
      person = timeline.person
      gedcom_file = person.gedcom_file

      return unless gedcom_file&.file&.attached?

      blob_key = gedcom_file.file.attachment.key

      timeline_events = GedcomApi.timeline(blob_key, person.gedcom_uuid)

      events = timeline_events.map do |e|
        CreateEvent.new(e, person, user_id).call
      end

      timeline.update(
        cached_events_for_display: timeline.cached_events_for_display.merge({ person: events.map(&:id) }),
        start_at: events.first&.start_date&.date,
        end_at: events.last&.end_date&.date
      )
    end
  end
end
