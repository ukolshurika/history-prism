# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventSerializer do
  let(:user)     { create(:user) }
  let(:start_fd) { create(:fuzzy_date, original_text: '1850', year: 1850, date_type: :year, month: nil, day: nil) }
  let(:location) { create(:location, place: 'Москва', latitude: 55.7558, longitude: 37.6173) }
  let(:event) do
    create(:event,
      creator: user,
      title: 'Test Event',
      description: 'A description',
      category: :person,
      start_date: start_fd,
      location: location)
  end

  let(:serializer)     { described_class.new(event) }
  let(:serialization)  { ActiveModelSerializers::Adapter.create(serializer) }

  describe 'attributes' do
    subject { serialization.as_json }

    it 'includes basic attributes' do
      expect(subject[:id]).to eq(event.id)
      expect(subject[:title]).to eq('Test Event')
      expect(subject[:description]).to eq('A description')
      expect(subject[:category]).to eq('person')
    end

    it 'includes creator as an inline hash' do
      expect(subject[:creator]).to eq(id: user.id, email: user.email)
    end

    it 'includes start_date_display with original_text' do
      expect(subject[:start_date_display]).to eq('1850')
    end

    it 'includes page_number' do
      expect(subject).to have_key(:page_number)
    end

    it 'includes source_type and source_id' do
      expect(subject).to have_key(:source_type)
      expect(subject).to have_key(:source_id)
    end

    it 'includes source_url' do
      expect(subject).to have_key(:source_url)
    end
  end

  describe '#location' do
    subject { serialization.as_json }

    it 'includes location with place and coordinates' do
      expect(subject[:location]).to be_present
      expect(subject[:location][:place]).to eq('Москва')
      expect(subject[:location][:latitude]).to be_present
      expect(subject[:location][:longitude]).to be_present
    end

    context 'when event has no location' do
      let(:event) { create(:event, creator: user, location: nil) }

      it 'returns nil for location' do
        expect(subject[:location]).to be_nil
      end
    end
  end

  describe '#start_date_display' do
    it 'returns original_text of start_date' do
      expect(serializer.start_date_display).to eq('1850')
    end

    context 'when no start_date' do
      let(:event) { create(:event, creator: user, start_date: nil, end_date: nil) }

      it 'returns nil' do
        expect(serializer.start_date_display).to be_nil
      end
    end
  end

  describe '#source_name' do
    context 'when source is a Book' do
      let(:book)  { create(:book, creator: user) }
      let(:event) { create(:event, creator: user, source: book) }

      it 'returns book attachment filename' do
        expect(serializer.source_name).to be_present
      end
    end

    context 'when no source' do
      let(:event) { create(:event, creator: user) }

      it 'returns nil' do
        expect(serializer.source_name).to be_nil
      end
    end
  end

  describe '#source_url' do
    context 'when source is a Book' do
      let(:book) { create(:book, creator: user) }
      let(:event) { create(:event, creator: user, source: book, page_number: 12) }

      it 'returns attachment url with page anchor' do
        expect(serializer.source_url).to include('#page=12')
      end
    end

    context 'when source is a GedcomFile' do
      let(:gedcom_file) { create(:gedcom_file, user: user) }
      let(:event) { create(:event, creator: user, source: gedcom_file) }

      it 'returns file url' do
        expect(serializer.source_url).to be_present
        expect(serializer.source_url).not_to include('#page=')
      end
    end

    context 'when event has no source' do
      let(:event) { create(:event, creator: user) }

      it 'returns nil' do
        expect(serializer.source_url).to be_nil
      end
    end
  end
end
