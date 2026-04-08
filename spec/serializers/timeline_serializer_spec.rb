require 'rails_helper'

RSpec.describe TimelineSerializer, type: :serializer do
  let(:user) { create(:user) }
  let(:person) do
    create(:person, user: user, name: 'Jane Doe', first_name: 'Jane', last_name: 'Doe').tap do |record|
      record.update_column(:name, '')
    end
  end
  let(:timeline) { create(:timeline, user: user, person: person) }
  let(:serializer) { described_class.new(timeline) }
  let(:serialization) { ActiveModelSerializers::Adapter.create(serializer) }
  let(:subject) { JSON.parse(serialization.to_json) }

  describe '#person_name' do
    it 'falls back to first_name and last_name when person.name is blank' do
      expect(subject['person_name']).to eq('Jane Doe')
    end
  end

  describe '#categorized_events' do
    let(:exact_date) { create(:fuzzy_date, original_text: '1900-01-01', date_type: :exact, year: 1900, month: 1, day: 1) }
    let(:month_year_date) { create(:fuzzy_date, original_text: '1900-05', date_type: :month_year, year: 1900, month: 5, day: nil) }
    let(:year_date) { create(:fuzzy_date, :year_only, original_text: '1900', year: 1900) }

    let!(:exact_event) do
      create(
        :event,
        creator: user,
        category: :person,
        start_date: exact_date,
        end_date: exact_date
      )
    end

    let!(:month_year_event) do
      create(
        :event,
        creator: user,
        category: :local,
        start_date: month_year_date,
        end_date: month_year_date
      )
    end

    let!(:year_event) do
      create(
        :event,
        creator: user,
        category: :world,
        start_date: year_date,
        end_date: year_date
      )
    end

    before do
      timeline.update!(
        cached_events_for_display: {
          'person' => [exact_event.id],
          'local' => [month_year_event.id],
          'world' => [year_event.id],
          'country' => []
        }
      )
      allow(Current).to receive(:user).and_return(user)
    end

    it 'formats timeline dates for compact reading' do
      expect(subject.dig('categorized_events', 'personal', 0, 'start_date_text')).to eq('01/01/1900')
      expect(subject.dig('categorized_events', 'local', 0, 'start_date_text')).to eq('05/1900')
      expect(subject.dig('categorized_events', 'world', 0, 'start_date_text')).to eq('1900')
    end
  end
end
