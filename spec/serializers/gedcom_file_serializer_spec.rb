# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GedcomFileSerializer, type: :serializer do
  let(:user) { create(:user) }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:serializer) { GedcomFileSerializer.new(gedcom_file) }
  let(:serialization) { ActiveModelSerializers::Adapter.create(serializer) }
  let(:subject) { JSON.parse(serialization.to_json) }

  describe 'attributes' do
    it 'includes id' do
      expect(subject['id']).to eq(gedcom_file.id)
    end

    it 'includes user_id' do
      expect(subject['user_id']).to eq(user.id)
    end

    it 'includes created_at' do
      expect(subject['created_at']).to be_present
    end

    it 'includes updated_at' do
      expect(subject['updated_at']).to be_present
    end

    it 'includes file_name' do
      expect(subject['file_name']).to eq('test.ged')
    end

    it 'includes file_url' do
      expect(subject['file_url']).to be_present
      expect(subject['file_url']).to include('/rails/active_storage/blobs')
    end
  end

  describe 'file_name' do
    context 'when file is attached' do
      it 'returns the filename as a string' do
        expect(subject['file_name']).to eq('test.ged')
      end
    end
  end

  describe 'file_url' do
    context 'when file is attached' do
      it 'returns the file URL path' do
        expect(subject['file_url']).to be_present
        expect(subject['file_url']).to match(%r{/rails/active_storage/blobs})
      end
    end
  end

  describe 'serialization structure' do
    it 'returns a hash with expected keys' do
      expected_keys = %w[id user_id created_at updated_at file_name file_url]
      expect(subject.keys).to match_array(expected_keys)
    end
  end
end
