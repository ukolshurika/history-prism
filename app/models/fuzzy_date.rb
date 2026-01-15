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

  # Default margin for uncertain dates (BEF/AFT) in years
  UNCERTAINTY_MARGIN = 50

  def calculate_gregorian_dates
    return if year.blank?

    self.earliest_gregorian = calculate_earliest
    self.latest_gregorian = calculate_latest
    self.sort_value = calculate_sort_value
  end

  def calculate_earliest
    case date_type
    when 'before'
      # "BEF 1925" means event happened before 1925, so earliest could be much earlier
      Date.new(year - UNCERTAINTY_MARGIN, month || 1, day || 1)
    when 'after'
      # "AFT 1925" means event happened after 1925, so earliest is just after the boundary
      boundary = Date.new(year, month || 12, day || days_in_month(year, month || 12))
      boundary + 1.day
    else
      Date.new(year, month || 1, day || 1)
    end
  rescue ArgumentError
    nil
  end

  def calculate_latest
    case date_type
    when 'before'
      # "BEF 1925" means event happened before 1925, so latest is just before the boundary
      boundary = Date.new(year, month || 1, day || 1)
      boundary - 1.day
    when 'after'
      # "AFT 1925" means event happened after 1925, so latest could be much later
      Date.new(year + UNCERTAINTY_MARGIN, month || 12, day || days_in_month(year, month || 12))
    when 'between', 'from_to'
      if year_end.present?
        Date.new(year_end, month_end || 12, day_end || days_in_month(year_end, month_end || 12))
      else
        Date.new(year, month || 12, day || days_in_month(year, month || 12))
      end
    else
      Date.new(year, month || 12, day || days_in_month(year, month || 12))
    end
  rescue ArgumentError
    nil
  end

  def calculate_sort_value
    # For sorting, use the boundary date for BEF/AFT, otherwise use earliest
    case date_type
    when 'before'
      # Sort by the boundary date (the known reference point)
      Date.new(year, month || 1, day || 1)
    when 'after'
      # Sort by the boundary date (the known reference point)
      Date.new(year, month || 1, day || 1)
    else
      earliest_gregorian
    end
  rescue ArgumentError
    earliest_gregorian
  end

  def days_in_month(year, month)
    Date.new(year, month, -1).day
  end
end
