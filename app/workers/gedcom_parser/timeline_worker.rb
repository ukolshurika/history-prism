# frozen_string_literal: true

module GedcomParser
  class TimelineWorker
    include Sidekiq::Worker

    def perform(timeline_id, user_id)
      timeline = Timeline.find(timeline_id)
      person = timeline.person
      gedcom_file = person.gedcom_file

      return unless gedcom_file&.file&.attached?

      blob_key = gedcom_file.file.attachment.key

      events =
        GedcomParserApi.timeline(blob_key, person.gedcom_uuid)

      events.map do |e|
        CreateEvent.new(e, person, user_id)
      end

      timeline.update(
        cached_events_for_display: timeline.cached_events_for_display.merge({ person: events.pluck(:id) }),
        start_at: parse_date(timeline_data.dig('events', 0, 'begin')),
        end_at: parse_date(timeline_data.dig('events', -1, 'end'))
      )
    end

    private

    def parse_date(date_string)
      return nil if date_string.blank?

      Date.parse(date_string)
    rescue ArgumentError
      nil
    end
  end
end
