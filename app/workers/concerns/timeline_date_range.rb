# frozen_string_literal: true

module TimelineDateRange
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
    end_year = end_date.present? ? end_date.year : start_year + 100

    [start_year, end_year]
  end
end
