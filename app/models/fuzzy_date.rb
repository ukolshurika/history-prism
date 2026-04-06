class FuzzyDate < ApplicationRecord
  include Comparable

  MODIFIER_PREFIXES = {
    about: 'ABT',
    before: 'BEF',
    after: 'AFT',
    estimated: 'EST',
    calculated: 'CAL'
  }.freeze

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

  class << self
    def find_or_create_from_attrs!(attrs)
      normalized = normalize_input(attrs)
      return if normalized.blank?

      original_text = normalized.delete(:original_text)

      find_or_create_by!(original_text: original_text) do |fuzzy_date|
        fuzzy_date.assign_attributes(normalized)
      end
    rescue ActiveRecord::RecordNotUnique
      find_by!(original_text: original_text)
    end

    private

    def normalize_input(attrs)
      raw_attrs =
        if attrs.respond_to?(:to_unsafe_h)
          attrs.to_unsafe_h
        elsif attrs.respond_to?(:to_h)
          attrs.to_h
        else
          attrs
        end

      return if raw_attrs.blank?

      raw_attrs = raw_attrs.deep_symbolize_keys
      year = raw_attrs[:year].presence&.to_i
      return if year.blank?

      month = raw_attrs[:month].presence&.to_i
      day = raw_attrs[:day].presence&.to_i
      year_end = raw_attrs[:year_end].presence&.to_i
      month_end = raw_attrs[:month_end].presence&.to_i
      day_end = raw_attrs[:day_end].presence&.to_i

      normalized = {
        year: year,
        month: month,
        day: day,
        year_end: year_end,
        month_end: month_end,
        day_end: day_end,
        date_type: (raw_attrs[:date_type].presence || infer_date_type(month, day)).to_s,
        calendar_type: (raw_attrs[:calendar_type].presence || 'gregorian').to_s
      }

      normalized.merge(original_text: raw_attrs[:original_text].presence || build_original_text(normalized))
    end

    def infer_date_type(month, day)
      return :exact if month.present? && day.present?
      return :month_year if month.present?

      :year
    end

    def build_original_text(attrs)
      date_type = attrs[:date_type].to_s

      case date_type
      when 'between'
        "BET #{format_partial_date(attrs[:year], attrs[:month], attrs[:day])} AND #{format_partial_date(attrs[:year_end], attrs[:month_end], attrs[:day_end])}"
      when 'from_to'
        "FROM #{format_partial_date(attrs[:year], attrs[:month], attrs[:day])} TO #{format_partial_date(attrs[:year_end], attrs[:month_end], attrs[:day_end])}"
      when *MODIFIER_PREFIXES.keys.map(&:to_s)
        "#{MODIFIER_PREFIXES.fetch(date_type.to_sym)} #{format_partial_date(attrs[:year], attrs[:month], attrs[:day])}"
      else
        format_partial_date(attrs[:year], attrs[:month], attrs[:day])
      end
    end

    def format_partial_date(year, month, day)
      return '' if year.blank?
      return format('%<year>d-%<month>02d-%<day>02d', year: year, month: month, day: day) if month.present? && day.present?
      return format('%<year>d-%<month>02d', year: year, month: month) if month.present?

      year.to_s
    end
  end

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
