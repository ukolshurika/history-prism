# frozen_string_literal: true

require 'rails_helper'

RSpec.describe BookSerializer do
  let(:user) { create(:user) }
  let(:book) { create(:book, creator: user, name: 'My Book', location: 'London') }
  let(:serializer) { described_class.new(book) }
  let(:serialization) { ActiveModelSerializers::Adapter.create(serializer) }

  describe 'attributes' do
    subject { serialization.as_json }

    it 'includes basic attributes' do
      expect(subject[:id]).to eq(book.id)
      expect(subject[:name]).to eq('My Book')
      expect(subject[:location]).to eq('London')
      expect(subject[:creator_id]).to eq(user.id)
      expect(subject[:created_at]).to be_present
      expect(subject[:updated_at]).to be_present
    end

    it 'includes attachment_name when attachment is present' do
      expect(subject[:attachment_name]).to eq('test.pdf')
    end

    it 'includes attachment_url when attachment is present' do
      expect(subject[:attachment_url]).to include('/rails/active_storage/blobs')
    end

    it 'includes events_count' do
      create(:event, source: book)
      create(:event, source: book)

      expect(subject[:events_count]).to eq(2)
    end
  end

  describe '#attachment_name' do
    context 'when attachment is present' do
      it 'returns the filename' do
        expect(serializer.attachment_name).to eq('test.pdf')
      end
    end

    context 'when attachment is not present' do
      before { book.attachment.purge }

      it 'returns nil' do
        expect(serializer.attachment_name).to be_nil
      end
    end
  end

  describe '#attachment_url' do
    context 'when attachment is present' do
      it 'returns the blob path' do
        expect(serializer.attachment_url).to include('/rails/active_storage/blobs')
      end
    end

    context 'when attachment is not present' do
      before { book.attachment.purge }

      it 'returns nil' do
        expect(serializer.attachment_url).to be_nil
      end
    end
  end

  describe '#events_count' do
    it 'returns 0 when no events exist' do
      expect(serializer.events_count).to eq(0)
    end

    it 'returns the correct count when events exist' do
      create_list(:event, 3, source: book)
      expect(serializer.events_count).to eq(3)
    end
  end
end
