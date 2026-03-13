# frozen_string_literal: true

module Books
  class DateParser
    MONTHS = {
      'январь' => 1,  'января' => 1,
      'февраль' => 2, 'февраля' => 2,
      'март' => 3,    'марта' => 3,
      'апрель' => 4,  'апреля' => 4,
      'май' => 5,     'мая' => 5,
      'июнь' => 6,    'июня' => 6,
      'июль' => 7,    'июля' => 7,
      'август' => 8,  'августа' => 8,
      'сентябрь' => 9,  'сентября' => 9,
      'октябрь' => 10,  'октября' => 10,
      'ноябрь' => 11,   'ноября' => 11,
      'декабрь' => 12,  'декабря' => 12
    }.freeze

    ROMAN_VALUES = {
      'M' => 1000, 'CM' => 900, 'D' => 500, 'CD' => 400,
      'C' => 100, 'XC' => 90, 'L' => 50, 'XL' => 40,
      'X' => 10, 'IX' => 9, 'V' => 5, 'IV' => 4, 'I' => 1
    }.freeze

    def initialize(raw_string)
      @raw = raw_string.to_s.strip
    end

    def parse
      return nil if @raw.blank?

      result = try_iso ||
               try_exact_date ||
               try_month_year ||
               try_decade ||
               try_year_range ||
               try_between ||
               try_approximate ||
               try_before ||
               try_after ||
               try_year_only ||
               try_century

      return nil unless result

      { original_text: @raw, calendar_type: :gregorian }.merge(result)
    end

    private

    def normalized
      @normalized ||= @raw.downcase
    end

    # 1945-05-08, 1945-05
    def try_iso
      if normalized =~ /^(\d{4})-(\d{2})-(\d{2})$/
        { year: $1.to_i, month: $2.to_i, day: $3.to_i, date_type: :exact }
      elsif normalized =~ /^(\d{4})-(\d{2})$/
        { year: $1.to_i, month: $2.to_i, day: nil, date_type: :month_year }
      end
    end

    # 25 июля 1774 года / 25 июля 1774 г.
    def try_exact_date
      return unless normalized =~ /^(\d{1,2})\s+([а-яё]+)\s+(\d{3,4})/
      month = MONTHS[$2]
      return unless month

      { year: $3.to_i, month: month, day: $1.to_i, date_type: :exact }
    end

    # июль 1774 года / в июле 1774
    def try_month_year
      return unless normalized =~ /(?:^|\s)([а-яё]+)\s+(\d{3,4})/
      month = MONTHS[$1]
      return unless month

      { year: $2.to_i, month: month, day: nil, date_type: :month_year }
    end

    # 1770-е годы / 1770-х годах
    def try_decade
      return unless normalized =~ /^(\d{3,4})-(?:е|ё|х)/

      year = $1.to_i
      { year: year, year_end: year + 9, month: nil, day: nil, month_end: nil, day_end: nil, date_type: :between }
    end

    # 1770-1780 / 1770–1780 / 1770—1780
    def try_year_range
      return unless normalized =~ /^(\d{3,4})\s*[-–—]\s*(\d{3,4})$/

      { year: $1.to_i, year_end: $2.to_i, month: nil, day: nil, month_end: nil, day_end: nil, date_type: :between }
    end

    # между 1770 и 1780
    def try_between
      return unless normalized =~ /между\s+(\d{3,4})\s+и\s+(\d{3,4})/

      { year: $1.to_i, year_end: $2.to_i, month: nil, day: nil, month_end: nil, day_end: nil, date_type: :between }
    end

    # около 1800 / ок. 1800 / приблизительно 1800 / примерно 1800
    def try_approximate
      return unless normalized =~ /(?:около|ок\.?|приблизительно|примерно)\s+(\d{3,4})/

      { year: $1.to_i, month: nil, day: nil, date_type: :about }
    end

    # до 1900 / не позднее 1900
    def try_before
      return unless normalized =~ /(?:до|не позднее)\s+(\d{3,4})/

      { year: $1.to_i, month: nil, day: nil, date_type: :before }
    end

    # после 1900 / не ранее 1900
    def try_after
      return unless normalized =~ /(?:после|не ранее)\s+(\d{3,4})/

      { year: $1.to_i, month: nil, day: nil, date_type: :after }
    end

    # 1773 / 1984 г. / 1984 год / 1984 года
    def try_year_only
      return unless normalized =~ /^(\d{3,4})(?:\s*(?:г\.?|лет|год[ауе]?))?$/

      { year: $1.to_i, month: nil, day: nil, date_type: :year }
    end

    # XVIII век / начало XVIII века / середина XVIII века / конец XVIII века
    def try_century
      qualifier_match = @raw.match(/\A(начало|середина|конец)\s+/i)
      qualifier = qualifier_match&.[](1)&.downcase
      remaining = qualifier_match ? @raw[qualifier_match[0].length..] : @raw

      roman_match = remaining.match(/\A([IVXLCDM]+)\s+(?:в\.|вв\.?|века?|веков)/i)
      return unless roman_match

      century = parse_roman(roman_match[1].upcase)
      return unless century

      start_year = (century - 1) * 100 + 1
      end_year   = century * 100

      year, year_end = case qualifier
                       when 'начало'   then [start_year, start_year + 32]
                       when 'середина' then [start_year + 33, start_year + 66]
                       when 'конец'    then [start_year + 67, end_year]
                       else                 [start_year, end_year]
                       end

      { year: year, year_end: year_end, month: nil, day: nil, month_end: nil, day_end: nil, date_type: :between }
    end

    def parse_roman(str)
      result = 0
      remaining = str.upcase
      ROMAN_VALUES.each do |symbol, value|
        while remaining.start_with?(symbol)
          result += value
          remaining = remaining[symbol.length..]
        end
      end
      remaining.empty? && result.positive? ? result : nil
    end
  end
end
