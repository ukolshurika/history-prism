require 'rails_helper'

RSpec.describe Gedcom::CreateEvent do
  describe '#call' do
    let(:user) { create(:user) }
    let(:gedcom_file) { create(:gedcom_file, user: user) }
    let(:person) { create(:person, user: user, gedcom_file: gedcom_file) }
    let(:gedcom_event) do
      instance_double(
        GedcomApi::Event,
        name: 'Birth',
        description: 'Born',
        place: 'Moscow',
        notes: [],
        date: '1900-01-01'
      )
    end

    subject(:service) do
      described_class.new(gedcom_event, person, user.id, gedcom_file.id)
    end

    it 'reuses the existing fuzzy date when a unique race occurs' do
      existing_date = create(:fuzzy_date, original_text: '1900-01-01', year: 1900, month: 1, day: 1)

      allow(FuzzyDate).to receive(:find_or_create_by!)
        .with(original_text: '1900-01-01')
        .and_raise(ActiveRecord::RecordNotUnique)
      allow(FuzzyDate).to receive(:find_by!).with(original_text: '1900-01-01').and_return(existing_date)

      event = service.call

      expect(event.start_date).to eq(existing_date)
      expect(event.end_date).to eq(existing_date)
    end
  end
end
