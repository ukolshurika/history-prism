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
end
