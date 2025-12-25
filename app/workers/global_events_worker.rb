# frozen_string_literal: true

class GlobalEventsWorker
  include Sidekiq::Worker

  def perform(timeline_id)
    timeline = Timeline.find(timeline_id)
    person = timeline.person

    # Calculate the date range for the person's lifetime
    date_range = calculate_date_range(timeline, person)
    return unless date_range

    start_year, end_year = date_range

    # Find world events within the date range
    world_events = find_events_by_category(:world, start_year, end_year)

    # Find country events (Russia) within the date range
    country_events = find_events_by_category(:country, start_year, end_year)

    # Update the timeline with global events
    timeline.update(
      cached_events_for_display: timeline.cached_events_for_display.merge(
        world: world_events.map(&:id),
        country: country_events.map(&:id)
      )
    )

    Rails.logger.info "GlobalEventsWorker completed for timeline #{timeline_id}: " \
                      "#{world_events.size} world events, #{country_events.size} country events"
  end

  private

  def calculate_date_range(timeline, person)
    # Use timeline start_at and end_at if available
    start_date = timeline.start_at
    end_date = timeline.end_at

    # If no dates on timeline, try to get from person's events
    if start_date.blank?
      person_events = person.events.joins(:start_date).order('fuzzy_dates.earliest_gregorian ASC')
      start_date = person_events.first&.start_date&.earliest_gregorian
    end

    return nil unless start_date

    # Calculate end year (death year or birth year + 100)
    start_year = start_date.year

    if end_date.present?
      end_year = end_date.year
    else
      # If no end date, assume person lived 100 years
      end_year = start_year + 100
    end

    [start_year, end_year]
  end

  def find_events_by_category(category, start_year, end_year)
    Event.where(category: category)
          .joins(:start_date)
          .where('fuzzy_dates.year >= ? AND fuzzy_dates.year <= ?', start_year, end_year)
          .order('fuzzy_dates.earliest_gregorian ASC')
  end
end
