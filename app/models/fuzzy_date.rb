class FuzzyDate < ApplicationRecord
  include Comparable

  has_many :events_as_start_date, class_name: 'Event', foreign_key: 'start_date_id', dependent: :nullify
  has_many :events_as_end_date, class_name: 'Event', foreign_key: 'end_date_id', dependent: :nullify

  validates :original_text, presence: true

  enum :date_type, {
    exact: 0,
    about: 1,
    before: 2,
    after: 3,
    estimated: 4,
    calculated: 5,
    between: 6,
    from_to: 7,
    year: 8,
    month_year: 9
  }

  enum :calendar_type, {
    gregorian: 0,
    julian: 1,
    hebrew: 2,
    french_r: 3
  }

  before_save :calculate_gregorian_dates

  def date
    sort_value || earliest_gregorian
  end

  def <=>(other)
    return nil unless other.is_a?(FuzzyDate)

    sort_value <=> other.sort_value
  end

  private

  def calculate_gregorian_dates
    return if year.blank?

    self.earliest_gregorian = calculate_earliest
    self.latest_gregorian = calculate_latest
    self.sort_value = earliest_gregorian
  end

  def calculate_earliest
    Date.new(year, month || 1, day || 1)
  rescue ArgumentError
    nil
  end

  def calculate_latest
    if year_end.present?
      Date.new(year_end, month_end || 12, day_end || days_in_month(year_end, month_end || 12))
    else
      Date.new(year, month || 12, day || days_in_month(year, month || 12))
    end
  rescue ArgumentError
    nil
  end

  def days_in_month(year, month)
    Date.new(year, month, -1).day
  end
end
