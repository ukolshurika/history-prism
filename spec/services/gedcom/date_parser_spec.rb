# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Gedcom::DateParser do
  describe '#parse' do
    context 'with exact date formats' do
      it 'parses full date (day month year)' do
        result = described_class.new('1 JAN 1900').parse

        expect(result[:original_text]).to eq('1 JAN 1900')
        expect(result[:date_type]).to eq(:exact)
        expect(result[:year]).to eq(1900)
        expect(result[:month]).to eq(1)
        expect(result[:day]).to eq(1)
      end

      it 'parses month and year only' do
        result = described_class.new('JAN 1900').parse

        expect(result[:date_type]).to eq(:month_year)
        expect(result[:year]).to eq(1900)
        expect(result[:month]).to eq(1)
        expect(result[:day]).to be_nil
      end

      it 'parses year only' do
        result = described_class.new('1900').parse

        expect(result[:date_type]).to eq(:year)
        expect(result[:year]).to eq(1900)
        expect(result[:month]).to be_nil
        expect(result[:day]).to be_nil
      end
    end

    context 'with BEF (before) modifier' do
      it 'parses BEF with full date' do
        result = described_class.new('BEF 15 MAR 1925').parse

        expect(result[:original_text]).to eq('BEF 15 MAR 1925')
        expect(result[:date_type]).to eq(:before)
        expect(result[:year]).to eq(1925)
        expect(result[:month]).to eq(3)
        expect(result[:day]).to eq(15)
      end

      it 'parses BEF with year only' do
        result = described_class.new('BEF 1925').parse

        expect(result[:date_type]).to eq(:before)
        expect(result[:year]).to eq(1925)
        expect(result[:month]).to be_nil
        expect(result[:day]).to be_nil
      end

      it 'parses lowercase bef' do
        result = described_class.new('bef 1925').parse

        expect(result[:date_type]).to eq(:before)
        expect(result[:year]).to eq(1925)
      end
    end

    context 'with AFT (after) modifier' do
      it 'parses AFT with full date' do
        result = described_class.new('AFT 20 JUN 1880').parse

        expect(result[:original_text]).to eq('AFT 20 JUN 1880')
        expect(result[:date_type]).to eq(:after)
        expect(result[:year]).to eq(1880)
        expect(result[:month]).to eq(6)
        expect(result[:day]).to eq(20)
      end

      it 'parses AFT with year only' do
        result = described_class.new('AFT 1880').parse

        expect(result[:date_type]).to eq(:after)
        expect(result[:year]).to eq(1880)
        expect(result[:month]).to be_nil
        expect(result[:day]).to be_nil
      end
    end

    context 'with ABT (about) modifier' do
      it 'parses ABT with full date' do
        result = described_class.new('ABT 1 FEB 1850').parse

        expect(result[:original_text]).to eq('ABT 1 FEB 1850')
        expect(result[:date_type]).to eq(:about)
        expect(result[:year]).to eq(1850)
        expect(result[:month]).to eq(2)
        expect(result[:day]).to eq(1)
      end

      it 'parses ABT with year only' do
        result = described_class.new('ABT 1850').parse

        expect(result[:date_type]).to eq(:about)
        expect(result[:year]).to eq(1850)
      end
    end

    context 'with EST (estimated) modifier' do
      it 'parses EST with full date' do
        result = described_class.new('EST 10 OCT 1800').parse

        expect(result[:original_text]).to eq('EST 10 OCT 1800')
        expect(result[:date_type]).to eq(:estimated)
        expect(result[:year]).to eq(1800)
        expect(result[:month]).to eq(10)
        expect(result[:day]).to eq(10)
      end

      it 'parses EST with year only' do
        result = described_class.new('EST 1800').parse

        expect(result[:date_type]).to eq(:estimated)
        expect(result[:year]).to eq(1800)
      end
    end

    context 'with CAL (calculated) modifier' do
      it 'parses CAL with full date' do
        result = described_class.new('CAL 5 DEC 1860').parse

        expect(result[:original_text]).to eq('CAL 5 DEC 1860')
        expect(result[:date_type]).to eq(:calculated)
        expect(result[:year]).to eq(1860)
        expect(result[:month]).to eq(12)
        expect(result[:day]).to eq(5)
      end

      it 'parses CAL with year only' do
        result = described_class.new('CAL 1860').parse

        expect(result[:date_type]).to eq(:calculated)
        expect(result[:year]).to eq(1860)
      end
    end

    context 'with BET...AND (between) range' do
      it 'parses BET with full dates' do
        result = described_class.new('BET 1 JAN 1900 AND 31 DEC 1910').parse

        expect(result[:original_text]).to eq('BET 1 JAN 1900 AND 31 DEC 1910')
        expect(result[:date_type]).to eq(:between)
        expect(result[:year]).to eq(1900)
        expect(result[:month]).to eq(1)
        expect(result[:day]).to eq(1)
        expect(result[:year_end]).to eq(1910)
        expect(result[:month_end]).to eq(12)
        expect(result[:day_end]).to eq(31)
      end

      it 'parses BET with years only' do
        result = described_class.new('BET 1900 AND 1910').parse

        expect(result[:date_type]).to eq(:between)
        expect(result[:year]).to eq(1900)
        expect(result[:month]).to be_nil
        expect(result[:day]).to be_nil
        expect(result[:year_end]).to eq(1910)
        expect(result[:month_end]).to be_nil
        expect(result[:day_end]).to be_nil
      end

      it 'parses lowercase bet...and' do
        result = described_class.new('bet 1900 and 1910').parse

        expect(result[:date_type]).to eq(:between)
        expect(result[:year]).to eq(1900)
        expect(result[:year_end]).to eq(1910)
      end
    end

    context 'with FROM...TO range' do
      it 'parses FROM...TO with full dates' do
        result = described_class.new('FROM 1 JAN 1900 TO 31 DEC 1910').parse

        expect(result[:original_text]).to eq('FROM 1 JAN 1900 TO 31 DEC 1910')
        expect(result[:date_type]).to eq(:from_to)
        expect(result[:year]).to eq(1900)
        expect(result[:month]).to eq(1)
        expect(result[:day]).to eq(1)
        expect(result[:year_end]).to eq(1910)
        expect(result[:month_end]).to eq(12)
        expect(result[:day_end]).to eq(31)
      end

      it 'parses FROM...TO with years only' do
        result = described_class.new('FROM 1900 TO 1910').parse

        expect(result[:date_type]).to eq(:from_to)
        expect(result[:year]).to eq(1900)
        expect(result[:year_end]).to eq(1910)
      end
    end

    context 'with calendar markers' do
      it 'parses Gregorian calendar marker' do
        result = described_class.new('@#DGREGORIAN@ 1 JAN 1900').parse

        expect(result[:calendar_type]).to eq(:gregorian)
        expect(result[:year]).to eq(1900)
      end

      it 'parses Julian calendar marker' do
        result = described_class.new('@#DJULIAN@ 1 JAN 1900').parse

        expect(result[:calendar_type]).to eq(:julian)
        expect(result[:year]).to eq(1900)
      end

      it 'parses Hebrew calendar marker' do
        result = described_class.new('@#DHEBREW@ 1 JAN 5660').parse

        expect(result[:calendar_type]).to eq(:hebrew)
        expect(result[:year]).to eq(5660)
      end

      it 'parses French Republican calendar marker' do
        result = described_class.new('@#DFRENCH R@ 1 JAN 1').parse

        expect(result[:calendar_type]).to eq(:french_r)
        expect(result[:year]).to eq(1)
      end
    end

    context 'with blank or nil input' do
      it 'returns nil for blank string' do
        result = described_class.new('').parse

        expect(result).to be_nil
      end

      it 'returns nil for nil input' do
        result = described_class.new(nil).parse

        expect(result).to be_nil
      end

      it 'returns nil for whitespace only' do
        result = described_class.new('   ').parse

        expect(result).to be_nil
      end
    end

    context 'with all months' do
      %w[JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC].each_with_index do |month, index|
        it "parses #{month} correctly" do
          result = described_class.new("1 #{month} 2000").parse

          expect(result[:month]).to eq(index + 1)
        end
      end
    end
  end

  describe '#to_fuzzy_date' do
    it 'returns a FuzzyDate instance' do
      fuzzy_date = described_class.new('1 JAN 1900').to_fuzzy_date

      expect(fuzzy_date).to be_a(FuzzyDate)
    end

    it 'creates FuzzyDate with correct attributes for exact date' do
      fuzzy_date = described_class.new('15 MAR 1925').to_fuzzy_date

      expect(fuzzy_date.original_text).to eq('15 MAR 1925')
      expect(fuzzy_date.date_type).to eq('exact')
      expect(fuzzy_date.year).to eq(1925)
      expect(fuzzy_date.month).to eq(3)
      expect(fuzzy_date.day).to eq(15)
    end

    it 'creates FuzzyDate with correct attributes for BEF date' do
      fuzzy_date = described_class.new('BEF 1925').to_fuzzy_date

      expect(fuzzy_date.original_text).to eq('BEF 1925')
      expect(fuzzy_date.date_type).to eq('before')
      expect(fuzzy_date.year).to eq(1925)
    end

    it 'creates FuzzyDate with correct attributes for AFT date' do
      fuzzy_date = described_class.new('AFT 1880').to_fuzzy_date

      expect(fuzzy_date.original_text).to eq('AFT 1880')
      expect(fuzzy_date.date_type).to eq('after')
      expect(fuzzy_date.year).to eq(1880)
    end

    it 'creates FuzzyDate with correct attributes for BET...AND range' do
      fuzzy_date = described_class.new('BET 1900 AND 1910').to_fuzzy_date

      expect(fuzzy_date.date_type).to eq('between')
      expect(fuzzy_date.year).to eq(1900)
      expect(fuzzy_date.year_end).to eq(1910)
    end

    it 'returns nil for blank input' do
      fuzzy_date = described_class.new('').to_fuzzy_date

      expect(fuzzy_date).to be_nil
    end

    context 'when FuzzyDate is saved' do
      it 'calculates earliest_gregorian for BEF date extended before boundary' do
        fuzzy_date = described_class.new('BEF 1925').to_fuzzy_date
        fuzzy_date.save!

        # BEF 1925 means before 1925, so earliest is 50 years before
        expect(fuzzy_date.earliest_gregorian).to eq(Date.new(1875, 1, 1))
      end

      it 'calculates latest_gregorian for BEF date as day before boundary' do
        fuzzy_date = described_class.new('BEF 1925').to_fuzzy_date
        fuzzy_date.save!

        # BEF 1925 means before Jan 1, 1925, so latest is Dec 31, 1924
        expect(fuzzy_date.latest_gregorian).to eq(Date.new(1924, 12, 31))
      end

      it 'calculates earliest_gregorian for AFT date as day after boundary' do
        fuzzy_date = described_class.new('AFT 1880').to_fuzzy_date
        fuzzy_date.save!

        # AFT 1880 means after Dec 31, 1880, so earliest is Jan 1, 1881
        expect(fuzzy_date.earliest_gregorian).to eq(Date.new(1881, 1, 1))
      end

      it 'calculates latest_gregorian for AFT date extended after boundary' do
        fuzzy_date = described_class.new('AFT 1880').to_fuzzy_date
        fuzzy_date.save!

        # AFT 1880 means after 1880, so latest is 50 years after
        expect(fuzzy_date.latest_gregorian).to eq(Date.new(1930, 12, 31))
      end

      it 'calculates sort_value for BEF date as the boundary date' do
        fuzzy_date = described_class.new('BEF 1925').to_fuzzy_date
        fuzzy_date.save!

        # Sort by boundary date for consistent ordering
        expect(fuzzy_date.sort_value).to eq(Date.new(1925, 1, 1))
      end

      it 'calculates sort_value for AFT date as the boundary date' do
        fuzzy_date = described_class.new('AFT 1880').to_fuzzy_date
        fuzzy_date.save!

        # Sort by boundary date for consistent ordering
        expect(fuzzy_date.sort_value).to eq(Date.new(1880, 1, 1))
      end

      it 'calculates gregorian dates for BET...AND range' do
        fuzzy_date = described_class.new('BET 1900 AND 1910').to_fuzzy_date
        fuzzy_date.save!

        expect(fuzzy_date.earliest_gregorian).to eq(Date.new(1900, 1, 1))
        expect(fuzzy_date.latest_gregorian).to eq(Date.new(1910, 12, 31))
      end

      it 'calculates gregorian dates for exact date' do
        fuzzy_date = described_class.new('15 MAR 1925').to_fuzzy_date
        fuzzy_date.save!

        expect(fuzzy_date.earliest_gregorian).to eq(Date.new(1925, 3, 15))
        expect(fuzzy_date.latest_gregorian).to eq(Date.new(1925, 3, 15))
      end

      it 'calculates gregorian dates for year-only date' do
        fuzzy_date = described_class.new('1925').to_fuzzy_date
        fuzzy_date.save!

        expect(fuzzy_date.earliest_gregorian).to eq(Date.new(1925, 1, 1))
        expect(fuzzy_date.latest_gregorian).to eq(Date.new(1925, 12, 31))
      end
    end
  end
end
