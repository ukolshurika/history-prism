# frozen_string_literal: true

module Gedcom
  class DateParser
    MONTHS = {
      'JAN' => 1, 'FEB' => 2, 'MAR' => 3, 'APR' => 4,
      'MAY' => 5, 'JUN' => 6, 'JUL' => 7, 'AUG' => 8,
      'SEP' => 9, 'OCT' => 10, 'NOV' => 11, 'DEC' => 12
    }.freeze

    CALENDARS = {
      '@#DGREGORIAN@' => :gregorian,
      '@#DJULIAN@' => :julian,
      '@#DHEBREW@' => :hebrew,
      '@#DFRENCH R@' => :french_r
    }.freeze

    MODIFIERS = {
      'ABT' => :about,
      'BEF' => :before,
      'AFT' => :after,
      'EST' => :estimated,
      'CAL' => :calculated
    }.freeze

    def initialize(raw_string)
      @raw = raw_string.to_s.strip
    end

    def parse
      return nil if @raw.blank?

      {
        original_text: @raw,
        calendar_type: extract_calendar,
        date_type: :exact,
        **extract_date_parts
      }
    end

    def to_fuzzy_date
      attrs = parse
      return nil unless attrs

      FuzzyDate.new(attrs)
    end

    private

    def working_text
      @working_text ||= @raw.gsub(/@#D[\w\s]+@/, '').strip
    end

    def extract_calendar
      CALENDARS.find { |marker, _| @raw.include?(marker) }&.last || :gregorian
    end

    def extract_date_parts
      text = working_text

      if text =~ /^BET\s+(.+)\s+AND\s+(.+)$/i
        return { date_type: :between, **parse_date(::Regexp.last_match(1)),
                 **parse_end_date(::Regexp.last_match(2)) }
      end

      if text =~ /^FROM\s+(.+)\s+TO\s+(.+)$/i
        return { date_type: :from_to, **parse_date(::Regexp.last_match(1)),
                 **parse_end_date(::Regexp.last_match(2)) }
      end

      MODIFIERS.each do |mod, type|
        return { date_type: type, **parse_date(::Regexp.last_match(1)) } if text =~ /^#{mod}\s+(.+)$/i
      end

      parse_date(text).merge(date_type: infer_type(text))
    end

    def parse_date(text)
      parts = text.strip.split(/\s+/)

      case parts.size
      when 1
        { year: parts[0].to_i, month: nil, day: nil }
      when 2
        { year: parts[1].to_i, month: MONTHS[parts[0].upcase], day: nil }
      when 3
        { year: parts[2].to_i, month: MONTHS[parts[1].upcase], day: parts[0].to_i }
      else
        { year: nil, month: nil, day: nil }
      end
    end

    def parse_end_date(text)
      result = parse_date(text)
      {
        year_end: result[:year],
        month_end: result[:month],
        day_end: result[:day]
      }
    end

    def infer_type(text)
      parts = text.strip.split(/\s+/)
      case parts.size
      when 1 then :year
      when 2 then :month_year
      else :exact
      end
    end
  end
end
