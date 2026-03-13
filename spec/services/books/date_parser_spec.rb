# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Books::DateParser do
  subject(:parse) { described_class.new(input).parse }

  context 'with blank input' do
    let(:input) { '' }
    it { is_expected.to be_nil }
  end

  context 'with nil input' do
    let(:input) { nil }
    it { is_expected.to be_nil }
  end

  context 'with unrecognizable string' do
    let(:input) { 'в давние времена' }
    it { is_expected.to be_nil }
  end

  context 'with ISO full date' do
    let(:input) { '1945-05-08' }

    it { is_expected.to include(year: 1945, month: 5, day: 8, date_type: :exact) }
    it { is_expected.to include(original_text: '1945-05-08', calendar_type: :gregorian) }
  end

  context 'with ISO partial date' do
    let(:input) { '1945-05' }

    it { is_expected.to include(year: 1945, month: 5, day: nil, date_type: :month_year) }
  end

  context 'with Russian exact date' do
    let(:input) { '25 июля 1774 года' }

    it { is_expected.to include(year: 1774, month: 7, day: 25, date_type: :exact) }
    it { is_expected.to include(original_text: '25 июля 1774 года') }
  end

  context 'with Russian exact date abbreviated' do
    let(:input) { '1 января 1900 г.' }

    it { is_expected.to include(year: 1900, month: 1, day: 1, date_type: :exact) }
  end

  context 'with Russian month and year' do
    let(:input) { 'июль 1774 года' }

    it { is_expected.to include(year: 1774, month: 7, day: nil, date_type: :month_year) }
  end


  context 'with year only' do
    let(:input) { '1773' }

    it { is_expected.to include(year: 1773, month: nil, day: nil, date_type: :year) }
  end

  context 'with year and "г."' do
    let(:input) { '1984 г.' }

    it { is_expected.to include(year: 1984, month: nil, day: nil, date_type: :year) }
  end

  context 'with year and "год"' do
    let(:input) { '1984 год' }

    it { is_expected.to include(year: 1984, month: nil, day: nil, date_type: :year) }
  end

  context 'with year and "года"' do
    let(:input) { '1984 года' }

    it { is_expected.to include(year: 1984, month: nil, day: nil, date_type: :year) }
  end

  context 'with decade' do
    let(:input) { '1770-е годы' }

    it { is_expected.to include(year: 1770, year_end: 1779, date_type: :between) }
  end

  context 'with decade genitive form' do
    let(:input) { '1770-х годах' }

    it { is_expected.to include(year: 1770, year_end: 1779, date_type: :between) }
  end

  context 'with year range (hyphen)' do
    let(:input) { '1770-1780' }

    it { is_expected.to include(year: 1770, year_end: 1780, date_type: :between) }
  end

  context 'with year range (en-dash)' do
    let(:input) { '1770–1780' }

    it { is_expected.to include(year: 1770, year_end: 1780, date_type: :between) }
  end

  context 'with "между ... и ..."' do
    let(:input) { 'между 1770 и 1780' }

    it { is_expected.to include(year: 1770, year_end: 1780, date_type: :between) }
  end

  context 'with "около"' do
    let(:input) { 'около 1800' }

    it { is_expected.to include(year: 1800, date_type: :about) }
  end

  context 'with "ок."' do
    let(:input) { 'ок. 1800' }

    it { is_expected.to include(year: 1800, date_type: :about) }
  end

  context 'with "приблизительно"' do
    let(:input) { 'приблизительно 1800' }

    it { is_expected.to include(year: 1800, date_type: :about) }
  end

  context 'with "примерно"' do
    let(:input) { 'примерно 1800' }

    it { is_expected.to include(year: 1800, date_type: :about) }
  end

  context 'with "до"' do
    let(:input) { 'до 1900' }

    it { is_expected.to include(year: 1900, date_type: :before) }
  end

  context 'with "не позднее"' do
    let(:input) { 'не позднее 1900' }

    it { is_expected.to include(year: 1900, date_type: :before) }
  end

  context 'with "после"' do
    let(:input) { 'после 1900' }

    it { is_expected.to include(year: 1900, date_type: :after) }
  end

  context 'with "не ранее"' do
    let(:input) { 'не ранее 1900' }

    it { is_expected.to include(year: 1900, date_type: :after) }
  end

  context 'with century' do
    let(:input) { 'XVIII век' }

    it { is_expected.to include(year: 1701, year_end: 1800, date_type: :between) }
  end

  context 'with "начало ... века"' do
    let(:input) { 'начало XVIII века' }

    it { is_expected.to include(year: 1701, year_end: 1733, date_type: :between) }
  end

  context 'with "середина ... века"' do
    let(:input) { 'середина XVIII века' }

    it { is_expected.to include(year: 1734, year_end: 1767, date_type: :between) }
  end

  context 'with "конец ... века"' do
    let(:input) { 'конец XVIII века' }

    it { is_expected.to include(year: 1768, year_end: 1800, date_type: :between) }
  end

  context 'with XIX century' do
    let(:input) { 'XIX век' }

    it { is_expected.to include(year: 1801, year_end: 1900, date_type: :between) }
  end

  context 'always includes original_text and calendar_type' do
    let(:input) { '1773' }

    it { is_expected.to include(original_text: '1773', calendar_type: :gregorian) }
  end
end
