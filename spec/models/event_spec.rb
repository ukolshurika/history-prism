# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Event, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:creator).class_name('User') }
    it { is_expected.to belong_to(:source).optional }
    it { is_expected.to belong_to(:start_date).class_name('FuzzyDate').optional }
    it { is_expected.to belong_to(:end_date).class_name('FuzzyDate').optional }
    it { is_expected.to belong_to(:location).optional }
    it { is_expected.to have_and_belong_to_many(:people) }
  end

  describe 'validations' do
    let(:user) { create(:user) }

    it 'is valid with valid attributes' do
      event = build(:event, creator: user)
      expect(event).to be_valid
    end

    it 'is invalid without a title' do
      event = build(:event, title: nil)
      expect(event).not_to be_valid
      expect(event.errors[:title]).to include("can't be blank")
    end

    it 'is valid without a description' do
      event = build(:event, description: nil)
      expect(event).to be_valid
    end

    it 'is invalid without a category' do
      event = build(:event, category: nil)
      expect(event).not_to be_valid
      expect(event.errors[:category]).to include("can't be blank")
    end

    it 'is valid without a location' do
      event = build(:event, location: nil)
      expect(event).to be_valid
    end
  end

  describe 'search_full_text scope' do
    let!(:matching_event) { create(:event, title: 'Рождение Ивана', description: 'Иван родился в деревне') }
    let!(:other_event)    { create(:event, title: 'Battle of Waterloo', description: 'Napoleon was defeated') }

    it 'returns events matching the query by title' do
      results = Event.search_full_text('Иван')
      expect(results).to include(matching_event)
      expect(results).not_to include(other_event)
    end

    it 'returns events matching the query by description' do
      results = Event.search_full_text('деревне')
      expect(results).to include(matching_event)
    end

    it 'does not return unmatched events' do
      results = Event.search_full_text('unrelated')
      expect(results).not_to include(matching_event)
    end
  end

  describe 'location association' do
    let(:location) { create(:location, place: 'Санкт-Петербург', latitude: 59.9343, longitude: 30.3351) }
    let(:event)    { create(:event, location: location) }

    it 'is associated with a location' do
      expect(event.location).to eq(location)
      expect(event.location.place).to eq('Санкт-Петербург')
    end
  end

  describe 'nested attributes for location' do
    let(:user) { create(:user) }

    it 'creates a location via nested attributes' do
      event = create(:event, creator: user, location_attributes: { place: 'Москва', latitude: 55.7558, longitude: 37.6173 })
      expect(event.location).to be_present
      expect(event.location.place).to eq('Москва')
    end
  end

  describe 'categories' do
    it 'has person, world, country, local categories' do
      expect(Event.categories.keys).to match_array(%w[person world country local])
    end
  end

  describe 'sorting scopes' do
    let!(:earlier_date) { create(:fuzzy_date, year: 1900, month: 1, day: 1, sort_value: Date.new(1900, 1, 1)) }
    let!(:later_date) { create(:fuzzy_date, year: 1950, month: 1, day: 1, sort_value: Date.new(1950, 1, 1)) }
    let!(:amsterdam) { create(:location, place: 'Amsterdam') }
    let!(:zurich) { create(:location, place: 'Zurich') }
    let!(:earlier_event) { create(:event, start_date: earlier_date) }
    let!(:later_event) { create(:event, start_date: later_date) }
    let!(:amsterdam_event) { create(:event, location: amsterdam) }
    let!(:zurich_event) { create(:event, location: zurich) }

    it 'sorts by date ascending' do
      expect(Event.sorted_by_date('asc').where(id: [earlier_event.id, later_event.id]).first).to eq(earlier_event)
    end

    it 'sorts by place descending' do
      expect(Event.sorted_by_place('desc').where(id: [amsterdam_event.id, zurich_event.id]).first).to eq(zurich_event)
    end
  end
end
