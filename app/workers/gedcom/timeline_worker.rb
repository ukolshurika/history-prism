# frozen_string_literal: true

module Gedcom
  class TimelineWorker
    include Sidekiq::Worker

    def perform(timeline_id, user_id)
      timeline = Timeline.find(timeline_id)
      timeline.update!(processing_status: 'processing', processing_error: nil)
      person = timeline.person
      gedcom_file = person.gedcom_file

      return unless gedcom_file&.file&.attached?

      blob_key = gedcom_file.file.attachment.key

      timeline_events = GedcomApi.timeline(blob_key, person.gedcom_uuid)

      events = timeline_events.map do |e|
        CreateEvent.new(e, person, user_id, gedcom_file.id).call
      end

      # Calculate date range from all events
      start_dates = events.filter_map { |e| e.start_date&.earliest_gregorian }
      end_dates = events.filter_map { |e| e.end_date&.latest_gregorian || e.start_date&.latest_gregorian }

      timeline.update(
        cached_events_for_display: timeline.cached_events_for_display.merge({ person: events.map(&:id) }),
        start_at: start_dates.min,
        end_at: end_dates.max,
        processing_status: 'completed',
        processing_error: nil
      )

      # Schedule global and local events workers to run after personal events are loaded
      GlobalEventsWorker.perform_async(timeline_id)
      LocalEventsWorker.perform_async(timeline_id)
    rescue StandardError => e
      timeline&.update_columns(processing_status: 'failed', processing_error: e.message)
      raise
    end
  end
end
