# frozen_string_literal: true

class LocalEventsWorker
  include Sidekiq::Worker

  def perform(timeline_id)
    timeline = Timeline.find(timeline_id)
    person = timeline.person

    # Calculate the date range for the person's lifetime
    date_range = calculate_date_range(timeline, person)
    return unless date_range

    start_year, end_year = date_range

    # TODO: Filter local events by geographic proximity to the person's locations.
    # Once person events have location data, collect their lat/lng coordinates and
    # use PostGIS or a bounding-box query to find local events within a radius
    # (e.g. ~50 km) of those coordinates instead of returning all :local events.
    local_events = find_events_by_date(:local, start_year, end_year)

    timeline.update(
      cached_events_for_display: timeline.cached_events_for_display.merge(
        local: local_events.map(&:id)
      )
    )

    Rails.logger.info "LocalEventsWorker completed for timeline #{timeline_id}: " \
                      "#{local_events.size} local events"
  end

  private

  def calculate_date_range(timeline, person)
    start_date = timeline.start_at
    end_date = timeline.end_at

    if start_date.blank?
      person_events = person.events.joins(:start_date).order('fuzzy_dates.earliest_gregorian ASC')
      start_date = person_events.first&.start_date&.earliest_gregorian
    end

    return nil unless start_date

    start_year = start_date.year

    end_year = if end_date.present?
                 end_date.year
               else
                 start_year + 100
               end

    [start_year, end_year]
  end

  def find_events_by_date(category, start_year, end_year)
    Event.where(category: category)
         .joins(:start_date)
         .where('fuzzy_dates.year >= ? AND fuzzy_dates.year <= ?', start_year, end_year)
         .order('fuzzy_dates.earliest_gregorian ASC')
  end
end
