# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Gedcom::CreatePersonWorker, type: :worker do
  let(:user) { create(:user) }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:blob_key) { gedcom_file.file.attachment.key }
  let(:worker) { described_class.new }
  let(:person_id) { 'I001' }

  let(:person_response) do
    GedcomApi::Person.new(
      name: 'John Smith',
      givn: 'John',
      surn: 'Smith',
      id: "@#{person_id}@",
      gender: 'M'
    )
  end

  let(:timeline_events) do
    [
      GedcomApi::Event.new(
        name: 'Birth',
        date: '1 JAN 1900',
        description: 'Born in London',
        place: 'London, England',
        notes: 'Birth certificate available'
      ),
      GedcomApi::Event.new(
        name: 'Marriage',
        date: '15 JUN 1925',
        description: 'Married to Jane Doe',
        place: 'Westminster, London',
        notes: 'Marriage certificate ref: 123'
      ),
      GedcomApi::Event.new(
        name: 'Death',
        date: '31 DEC 1980',
        description: 'Died peacefully',
        place: 'London, England',
        notes: ''
      )
    ]
  end

  describe '#perform' do
    before do
      allow(GedcomApi).to receive(:person).and_return(person_response)
      allow(GedcomApi).to receive(:timeline).and_return(timeline_events)
    end

    it 'calls GedcomApi.person with correct parameters' do
      worker.perform(gedcom_file.id, blob_key, person_id, user.id)

      expect(GedcomApi).to have_received(:person).with(blob_key, person_id)
    end

    it 'accepts a batch of person ids' do
      expect {
        worker.perform(gedcom_file.id, blob_key, [person_id, 'I002'], user.id)
      }.to change(Person, :count).by(2)
    end

    it 'creates a person record' do
      expect {
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)
      }.to change(Person, :count).by(1)
    end

    it 'creates person with correct attributes' do
      worker.perform(gedcom_file.id, blob_key, person_id, user.id)

      person = Person.last
      expect(person.first_name).to eq('John')
      expect(person.last_name).to eq('Smith')
      expect(person.name).to eq('John Smith')
      expect(person.gedcom_uuid).to eq(person_id)
      expect(person.gedcom_file_id).to eq(gedcom_file.id)
      expect(person.user_id).to eq(user.id)
    end

    it 'calls GedcomApi.timeline with correct parameters' do
      worker.perform(gedcom_file.id, blob_key, person_id, user.id)

      expect(GedcomApi).to have_received(:timeline).with(blob_key, person_id)
    end

    context 'vital events creation' do
      it 'creates only Birth and Death events' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.to change(Event, :count).by(2)
      end

      it 'creates Birth event with correct attributes' do
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event).to be_present
        expect(birth_event.category).to eq('person')
        expect(birth_event.creator_id).to eq(user.id)
        expect(birth_event.source_type).to eq('GedcomFile')
        expect(birth_event.source_id).to eq(gedcom_file.id)
        expect(birth_event.description).to include('Born in London')
        expect(birth_event.description).to include('Place: London, England')
      end

      it 'creates Death event with correct attributes' do
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        death_event = Event.find_by(title: 'Death')
        expect(death_event).to be_present
        expect(death_event.category).to eq('person')
        expect(death_event.creator_id).to eq(user.id)
        expect(death_event.source_type).to eq('GedcomFile')
        expect(death_event.source_id).to eq(gedcom_file.id)
        expect(death_event.description).to include('Died peacefully')
      end

      it 'does not create Marriage event' do
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        expect(Event.find_by(title: 'Marriage')).to be_nil
      end

      it 'associates events with the created person' do
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        person = Person.last
        expect(person.events.count).to eq(2)
        expect(person.events.pluck(:title)).to match_array(%w[Birth Death])
      end

      it 'creates FuzzyDate records for events' do
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date).to be_a(FuzzyDate)
        expect(birth_event.start_date.year).to eq(1900)
        expect(birth_event.start_date.month).to eq(1)
        expect(birth_event.start_date.day).to eq(1)

        death_event = Event.find_by(title: 'Death')
        expect(death_event.start_date).to be_a(FuzzyDate)
        expect(death_event.start_date.year).to eq(1980)
        expect(death_event.start_date.month).to eq(12)
        expect(death_event.start_date.day).to eq(31)
      end
    end

    context 'when timeline has only Birth event' do
      let(:timeline_events) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: '1 JAN 1900',
            description: 'Born in London',
            place: 'London',
            notes: ''
          )
        ]
      end

      it 'creates only Birth event' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.to change(Event, :count).by(1)

        expect(Event.find_by(title: 'Birth')).to be_present
        expect(Event.find_by(title: 'Death')).to be_nil
      end
    end

    context 'when timeline has only Death event' do
      let(:timeline_events) do
        [
          GedcomApi::Event.new(
            name: 'Death',
            date: '31 DEC 1980',
            description: 'Died peacefully',
            place: 'London',
            notes: ''
          )
        ]
      end

      it 'creates only Death event' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.to change(Event, :count).by(1)

        expect(Event.find_by(title: 'Death')).to be_present
        expect(Event.find_by(title: 'Birth')).to be_nil
      end
    end

    context 'when timeline has no vital events' do
      let(:timeline_events) do
        [
          GedcomApi::Event.new(
            name: 'Marriage',
            date: '15 JUN 1925',
            description: 'Married to Jane Doe',
            place: 'Westminster',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Occupation',
            date: '1920',
            description: 'Blacksmith',
            place: 'London',
            notes: ''
          )
        ]
      end

      it 'does not create any events' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.not_to change(Event, :count)
      end

      it 'still creates the person' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.to change(Person, :count).by(1)
      end
    end

    context 'when timeline is empty' do
      let(:timeline_events) { [] }

      it 'does not create any events' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.not_to change(Event, :count)
      end

      it 'still creates the person' do
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.to change(Person, :count).by(1)
      end
    end

    context 'with uncertain date types' do
      let(:timeline_events) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'ABT 1895',
            description: 'Born around 1895',
            place: 'Unknown',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Death',
            date: 'BEF 1970',
            description: 'Died before 1970',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      it 'creates events with fuzzy dates' do
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('about')
        expect(birth_event.start_date.year).to eq(1895)

        death_event = Event.find_by(title: 'Death')
        expect(death_event.start_date.date_type).to eq('before')
        expect(death_event.start_date.year).to eq(1970)
      end
    end

    context 'deduplication on re-upload' do
      it 'does not create duplicate events on re-upload' do
        # First upload
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        expect(Event.count).to eq(2)

        # Second upload
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.not_to change(Event, :count)
      end

      it 'does not create duplicate person on re-upload' do
        # First upload
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        expect(Person.count).to eq(1)

        # Second upload
        expect {
          worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        }.not_to change(Person, :count)
      end

      it 'updates existing events on re-upload' do
        # First upload
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)
        birth_event = Event.find_by(title: 'Birth')
        original_id = birth_event.id

        # Update API response
        updated_events = [
          GedcomApi::Event.new(
            name: 'Birth',
            date: '1 JAN 1900',
            description: 'Born in Manchester',
            place: 'Manchester, England',
            notes: 'Updated'
          ),
          GedcomApi::Event.new(
            name: 'Death',
            date: '31 DEC 1980',
            description: 'Died peacefully',
            place: 'London, England',
            notes: ''
          )
        ]
        allow(GedcomApi).to receive(:timeline).and_return(updated_events)

        # Re-upload
        worker.perform(gedcom_file.id, blob_key, person_id, user.id)

        birth_event.reload
        expect(birth_event.id).to eq(original_id)
        expect(birth_event.description).to include('Born in Manchester')
      end
    end

    context 'when API errors occur' do
      context 'when person API fails' do
        before do
          allow(GedcomApi).to receive(:person)
            .and_raise(GedcomApi::Transport::ClientError.new('Person not found'))
        end

        it 'raises the API error' do
          expect {
            worker.perform(gedcom_file.id, blob_key, person_id, user.id)
          }.to raise_error(GedcomApi::Transport::ClientError, 'Person not found')
        end

        it 'does not create any records' do
          expect {
            begin
              worker.perform(gedcom_file.id, blob_key, person_id, user.id)
            rescue GedcomApi::Transport::ClientError
              # Expected
            end
          }.not_to change(Person, :count)
        end
      end

      context 'when timeline API fails' do
        before do
          allow(GedcomApi).to receive(:timeline)
            .and_raise(GedcomApi::Transport::ClientError.new('Timeline not found'))
        end

        it 'raises the API error' do
          expect {
            worker.perform(gedcom_file.id, blob_key, person_id, user.id)
          }.to raise_error(GedcomApi::Transport::ClientError, 'Timeline not found')
        end

        it 'creates the person before failing' do
          expect {
            begin
              worker.perform(gedcom_file.id, blob_key, person_id, user.id)
            rescue GedcomApi::Transport::ClientError
              # Expected
            end
          }.to change(Person, :count).by(1)
        end
      end
    end
  end
end
