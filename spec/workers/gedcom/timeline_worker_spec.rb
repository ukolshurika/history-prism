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

    context 'with BEF (before) date type' do
      let(:api_events_with_bef) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'BEF 1900',
            description: 'Born before 1900',
            place: 'Unknown',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Death',
            date: '31 DEC 1950',
            description: 'Died in 1950',
            place: 'London',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_bef)
      end

      it 'creates FuzzyDate with before date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('before')
        expect(birth_event.start_date.original_text).to eq('BEF 1900')
      end

      it 'calculates timeline start_at extended before the BEF boundary' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        # BEF 1900 means before 1900, so earliest is 50 years before (1850)
        expect(timeline.start_at).to eq(Date.new(1850, 1, 1))
      end

      it 'calculates timeline end_at correctly' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.end_at).to eq(Date.new(1950, 12, 31))
      end

      it 'sets latest_gregorian to day before the BEF boundary' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        # BEF 1900 means before Jan 1, 1900, so latest is Dec 31, 1899
        expect(birth_event.start_date.latest_gregorian).to eq(Date.new(1899, 12, 31))
      end
    end

    context 'with AFT (after) date type' do
      let(:api_events_with_aft) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: '1 JAN 1880',
            description: 'Born in 1880',
            place: 'London',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Death',
            date: 'AFT 1950',
            description: 'Died after 1950',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_aft)
      end

      it 'creates FuzzyDate with after date_type' do
        worker.perform(timeline.id, user.id)

        death_event = Event.find_by(title: 'Death')
        expect(death_event.start_date.date_type).to eq('after')
        expect(death_event.start_date.original_text).to eq('AFT 1950')
      end

      it 'calculates timeline start_at correctly' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to eq(Date.new(1880, 1, 1))
      end

      it 'calculates timeline end_at extended after the AFT boundary' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        # AFT 1950 means after 1950, so latest is 50 years after (2000)
        expect(timeline.end_at).to eq(Date.new(2000, 12, 31))
      end

      it 'sets earliest_gregorian to day after the AFT boundary' do
        worker.perform(timeline.id, user.id)

        death_event = Event.find_by(title: 'Death')
        # AFT 1950 means after Dec 31, 1950, so earliest is Jan 1, 1951
        expect(death_event.start_date.earliest_gregorian).to eq(Date.new(1951, 1, 1))
      end
    end

    context 'with ABT (about) date type' do
      let(:api_events_with_abt) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'ABT 1890',
            description: 'Born around 1890',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_abt)
      end

      it 'creates FuzzyDate with about date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('about')
        expect(birth_event.start_date.year).to eq(1890)
      end

      it 'calculates timeline dates based on about date' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to eq(Date.new(1890, 1, 1))
        expect(timeline.end_at).to eq(Date.new(1890, 12, 31))
      end
    end

    context 'with EST (estimated) date type' do
      let(:api_events_with_est) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'EST MAR 1850',
            description: 'Estimated birth in March 1850',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_est)
      end

      it 'creates FuzzyDate with estimated date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('estimated')
        expect(birth_event.start_date.year).to eq(1850)
        expect(birth_event.start_date.month).to eq(3)
      end
    end

    context 'with CAL (calculated) date type' do
      let(:api_events_with_cal) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'CAL 5 DEC 1860',
            description: 'Calculated birth date',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_cal)
      end

      it 'creates FuzzyDate with calculated date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('calculated')
        expect(birth_event.start_date.year).to eq(1860)
        expect(birth_event.start_date.month).to eq(12)
        expect(birth_event.start_date.day).to eq(5)
      end
    end

    context 'with BET...AND (between) date range' do
      let(:api_events_with_bet) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'BET 1890 AND 1895',
            description: 'Born between 1890 and 1895',
            place: 'Unknown',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Death',
            date: 'BET 1 JAN 1960 AND 31 DEC 1965',
            description: 'Died between 1960 and 1965',
            place: 'London',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_bet)
      end

      it 'creates FuzzyDate with between date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('between')
        expect(birth_event.start_date.year).to eq(1890)
        expect(birth_event.start_date.year_end).to eq(1895)
      end

      it 'calculates timeline start_at from earliest date' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to eq(Date.new(1890, 1, 1))
      end

      it 'calculates timeline end_at from latest date' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.end_at).to eq(Date.new(1965, 12, 31))
      end
    end

    context 'with FROM...TO date range' do
      let(:api_events_with_from_to) do
        [
          GedcomApi::Event.new(
            name: 'Residence',
            date: 'FROM 1 JAN 1920 TO 31 DEC 1930',
            description: 'Lived at this address',
            place: 'New York',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_from_to)
      end

      it 'creates FuzzyDate with from_to date_type' do
        worker.perform(timeline.id, user.id)

        residence_event = Event.find_by(title: 'Residence')
        expect(residence_event.start_date.date_type).to eq('from_to')
        expect(residence_event.start_date.year).to eq(1920)
        expect(residence_event.start_date.month).to eq(1)
        expect(residence_event.start_date.day).to eq(1)
        expect(residence_event.start_date.year_end).to eq(1930)
        expect(residence_event.start_date.month_end).to eq(12)
        expect(residence_event.start_date.day_end).to eq(31)
      end

      it 'calculates timeline dates from FROM...TO range' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to eq(Date.new(1920, 1, 1))
        expect(timeline.end_at).to eq(Date.new(1930, 12, 31))
      end
    end

    context 'with year-only date' do
      let(:api_events_with_year_only) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: '1875',
            description: 'Born in 1875',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_year_only)
      end

      it 'creates FuzzyDate with year date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('year')
        expect(birth_event.start_date.year).to eq(1875)
        expect(birth_event.start_date.month).to be_nil
        expect(birth_event.start_date.day).to be_nil
      end

      it 'calculates timeline start_at as Jan 1 of year' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to eq(Date.new(1875, 1, 1))
      end

      it 'calculates timeline end_at as Dec 31 of year' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.end_at).to eq(Date.new(1875, 12, 31))
      end
    end

    context 'with month-year date' do
      let(:api_events_with_month_year) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'MAR 1885',
            description: 'Born in March 1885',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_with_month_year)
      end

      it 'creates FuzzyDate with month_year date_type' do
        worker.perform(timeline.id, user.id)

        birth_event = Event.find_by(title: 'Birth')
        expect(birth_event.start_date.date_type).to eq('month_year')
        expect(birth_event.start_date.year).to eq(1885)
        expect(birth_event.start_date.month).to eq(3)
        expect(birth_event.start_date.day).to be_nil
      end

      it 'calculates timeline start_at as first day of month' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.start_at).to eq(Date.new(1885, 3, 1))
      end

      it 'calculates timeline end_at as last day of month' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        expect(timeline.end_at).to eq(Date.new(1885, 3, 31))
      end
    end

    context 'with mixed date types' do
      let(:api_events_mixed) do
        [
          GedcomApi::Event.new(
            name: 'Birth',
            date: 'ABT 1870',
            description: 'About 1870',
            place: 'Unknown',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Marriage',
            date: 'BET 1895 AND 1900',
            description: 'Married between 1895-1900',
            place: 'Unknown',
            notes: ''
          ),
          GedcomApi::Event.new(
            name: 'Death',
            date: 'AFT 1950',
            description: 'Died after 1950',
            place: 'Unknown',
            notes: ''
          )
        ]
      end

      before do
        allow(GedcomApi).to receive(:timeline).with(blob_key, person.gedcom_uuid).and_return(api_events_mixed)
      end

      it 'calculates timeline start_at from earliest event' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        # ABT 1870 has earliest = Jan 1, 1870 (about dates use the year directly)
        expect(timeline.start_at).to eq(Date.new(1870, 1, 1))
      end

      it 'calculates timeline end_at from latest event (AFT extended)' do
        worker.perform(timeline.id, user.id)
        timeline.reload

        # AFT 1950 means after 1950, so latest is extended to 2000
        expect(timeline.end_at).to eq(Date.new(2000, 12, 31))
      end

      it 'creates all events with correct date types' do
        worker.perform(timeline.id, user.id)

        expect(Event.find_by(title: 'Birth').start_date.date_type).to eq('about')
        expect(Event.find_by(title: 'Marriage').start_date.date_type).to eq('between')
        expect(Event.find_by(title: 'Death').start_date.date_type).to eq('after')
      end
    end
  end
end
