# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LocationSerializer, type: :serializer do
  let(:location) { create(:location, place: 'Москва', latitude: 55.7558, longitude: 37.6173) }
  let(:serializer) { described_class.new(location) }
  let(:serialization) { ActiveModelSerializers::Adapter.create(serializer) }
  let(:subject) { serialization.as_json }

  it 'serializes the expected location attributes' do
    expect(subject).to include(
      id: location.id,
      place: 'Москва',
      latitude: 55.7558,
      longitude: 37.6173
    )
  end
end
