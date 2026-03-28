# frozen_string_literal: true

require 'rails_helper'

RSpec.describe PersonSerializer, type: :serializer do
  let(:user) { create(:user) }
  let(:person) do
    create(
      :person,
      user: user,
      first_name: 'Jane',
      middle_name: 'Ann',
      last_name: 'Doe'
    )
  end
  let!(:birth_date) do
    create(:fuzzy_date, :year_only, original_text: '1850', year: 1850)
  end
  let!(:death_date) do
    create(:fuzzy_date, :year_only, original_text: '1910', year: 1910)
  end
  let!(:birth_event) do
    create(:event, creator: user, title: 'Birth', start_date: birth_date, people: [person])
  end
  let!(:death_event) do
    create(:event, creator: user, title: 'Death', start_date: death_date, people: [person])
  end
  let!(:timeline) { create(:timeline, user: user, person: person, title: 'Family timeline') }
  let(:serializer) { described_class.new(person) }
  let(:serialization) { ActiveModelSerializers::Adapter.create(serializer) }
  let(:subject) { serialization.as_json }

  describe 'attributes' do
    it 'serializes the full name from first, middle, and last names' do
      expect(subject[:full_name]).to eq('Jane Ann Doe')
    end

    it 'serializes birth and death years from related events' do
      expect(subject[:birth_year]).to eq(1850)
      expect(subject[:death_year]).to eq(1910)
    end

    it 'serializes timelines as inline hashes' do
      expect(subject[:timelines]).to include(id: timeline.id, title: 'Family timeline')
    end
  end
end
