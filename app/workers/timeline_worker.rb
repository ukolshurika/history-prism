# frozen_string_literal: true

class TimelineWorker
  include Sidekiq::Worker

  def perform(timeline_id, user_id)
    timeline = Timeline.find(timeline_id)
    person = timeline.person
    gedcom_file = person.gedcom_file

    return unless gedcom_file&.file&.attached?

    blob_key = gedcom_file.file.attachment.key

    response = GedcomParserApi.timeline(blob_key, person.gedcom_uuid)

    if response.success?
      timeline_data = JSON.parse(response.body)

      timeline.update(
        cached_events_for_display: timeline_data,
        start_at: parse_date(timeline_data.dig('events', 0, 'begin')),
        end_at: parse_date(timeline_data.dig('events', -1, 'end'))
      )
    end
  end

  private

  def parse_date(date_string)
    return nil if date_string.blank?

    Date.parse(date_string)
  rescue ArgumentError
    nil
  end
end
