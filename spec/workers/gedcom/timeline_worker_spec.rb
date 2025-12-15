# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Gedcom::TimelineWorker, type: :worker do
  let(:user) { create(:user) }
  let(:gedcom_file) { create(:gedcom_file, user: user) }
  let(:person) { create(:person, gedcom_file: gedcom_file, gedcom_uuid: 'I001') }
  let(:timeline) { create(:timeline, person: person) }
  let(:worker) { described_class.new }

  let(:blob_key) { gedcom_file.file.attachment.key }

  let(:api_events) do
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
      # Default stub - can be overridden in specific contexts
      allow(GedcomApi).to receive(:timeline).and_return([])
    end

    context 'when gedcom file exists with attached file' do
      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events)
      end

      it 'calls GedcomApi.timeline with correct parameters' do
        worker.perform(timeline.id, user.id)

        expect(GedcomApi).to have_received(:timeline).with(blob_key, person.gedcom_uuid)
      end

      it 'creates events for each API event' do
        expect {
          worker.perform(timeline.id, user.id)
        }.to change(Event, :count).by(3)
      end

      it 'creates events with correct titles' do
        worker.perform(timeline.id, user.id)

        event_titles = Event.last(3).map(&:title)
        expect(event_titles).to match_array(['Birth', 'Marriage', 'Death'])
      end

      it 'creates events with correct category' do
        worker.perform(timeline.id, user.id)

        Event.last(3).each do |event|
          expect(event.category).to eq('person')
        end
      end

      it 'creates events with correct creator' do
        worker.perform(timeline.id, user.id)

        Event.last(3).each do |event|
          expect(event.creator_id).to eq(user.id)
        end
      end

      it 'creates events with parsed dates as FuzzyDate records' do
        worker.perform(timeline.id, user.id)

        Event.last(3).each do |event|
          expect(event.start_date).to be_a(FuzzyDate)
          expect(event.end_date).to be_a(FuzzyDate)
        end
      end

      it 'creates FuzzyDate with correct original text' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.original_text).to eq('1 JAN 1900')
      end

      it 'creates FuzzyDate with parsed date components' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.year).to eq(1900)
        expect(birth_event.start_date.month).to eq(1)
        expect(birth_event.start_date.day).to eq(1)
      end

      it 'associates person with events' do
        worker.perform(timeline.id, user.id)

        Event.last(3).each do |event|
          expect(event.people).to include(person)
        end
      end

      it 'creates event descriptions with place and notes' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.description).to include('Born in London')
        expect(birth_event.description).to include('Place: London, England')
        expect(birth_event.description).to include('Notes: Birth certificate available')
      end

      it 'updates timeline cached_events_for_display' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        created_event_ids = Event.last(3).map(&:id)
        # Keys might be strings after database round-trip
        person_events = timeline.cached_events_for_display[:person] || timeline.cached_events_for_display['person']
        expect(person_events).to match_array(created_event_ids)
      end

      it 'updates timeline start_at with first event date' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        first_event = Event.find_by(title: 'Birth')
        expect(timeline.start_at).to eq(first_event.start_date.date)
      end

      it 'updates timeline end_at with last event date' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        last_event = Event.find_by(title: 'Death')
        expect(timeline.end_at).to eq(last_event.end_date.date)
      end

      it 'does not raise an error' do
        expect { worker.perform(timeline.id, user.id) }.not_to raise_error
      end

    end

    context 'when API returns empty timeline' do
      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return([])
      end

      it 'does not create any events' do
        expect {
          worker.perform(timeline.id, user.id)
        }.not_to change(Event, :count)
      end

      it 'updates cached_events_for_display with empty array' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        # Keys might be strings after database round-trip
        person_events = timeline.cached_events_for_display[:person] || timeline.cached_events_for_display['person']
        expect(person_events).to eq([])
      end

      it 'sets start_at and end_at to nil' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to be_nil
        expect(timeline.end_at).to be_nil
      end
    end

    context 'when timeline does not exist' do
      it 'raises ActiveRecord::RecordNotFound' do
        expect {
          worker.perform(999_999, user.id)
        }.to raise_error(ActiveRecord::RecordNotFound)
      end
    end

    context 'when API raises an error' do
      before do
        allow(GedcomApi).to receive(:timeline)
          .and_raise(GedcomApi::Transport::ClientError.new('API Error'))
      end

      it 'raises the API error' do
        expect {
          worker.perform(timeline.id, user.id)
        }.to raise_error(GedcomApi::Transport::ClientError, 'API Error')
      end

      it 'does not create any events' do
        expect {
          begin
            worker.perform(timeline.id, user.id)
          rescue GedcomApi::Transport::ClientError
            # Expected error
          end
        }.not_to change(Event, :count)
      end
    end
  end
end
