# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Books::CreateEvents do
  let(:user) { create(:user) }
  let(:book) { create(:book, creator: user) }

  describe '#call' do
    let(:events_data) do
      [
        {
          'title' => 'Event 1',
          'description' => 'Description 1',
          'date' => '2020-01-15'
        },
        {
          'title' => 'Event 2',
          'description' => 'Description 2',
          'date' => '2021-06-20',
          'end_date' => '2021-06-25'
        }
      ]
    end

    subject(:service) do
      described_class.new(
        book: book,
        events_data: events_data,
        user_id: user.id,
        page_number: 12
      )
    end

    it 'creates events for the book' do
      expect { service.call }.to change(Event, :count).by(2)
    end

    it 'associates events with the book as source' do
      service.call

      events = Event.last(2)
      expect(events.map(&:source)).to all(eq(book))
      expect(events.map(&:source_type)).to all(eq('Book'))
    end

    it 'sets correct event attributes' do
      service.call

      event = Event.find_by(title: 'Event 1')
      expect(event.description).to eq('Description 1')
      expect(event.category).to eq('local')
      expect(event.creator_id).to eq(user.id)
    end

    it 'creates fuzzy dates from date strings' do
      service.call

      event = Event.find_by(title: 'Event 1')
      expect(event.start_date).to be_present
      expect(event.start_date.year).to eq(2020)
      expect(event.start_date.month).to eq(1)
      expect(event.start_date.day).to eq(15)
    end

    it 'handles separate end dates' do
      service.call

      event = Event.find_by(title: 'Event 2')
      expect(event.start_date.year).to eq(2021)
      expect(event.start_date.month).to eq(6)
      expect(event.start_date.day).to eq(20)
      expect(event.end_date.year).to eq(2021)
      expect(event.end_date.month).to eq(6)
      expect(event.end_date.day).to eq(25)
    end

    it 'uses start_date for end_date if end_date not provided' do
      service.call

      event = Event.find_by(title: 'Event 1')
      expect(event.start_date).to eq(event.end_date)
    end

    context 'with symbol keys in events_data' do
      let(:events_data) do
        [
          {
            title: 'Symbol Event',
            description: 'Symbol Description',
            date: '2022-03-10'
          }
        ]
      end

      it 'handles symbol keys correctly' do
        expect { service.call }.to change(Event, :count).by(1)

        event = Event.last
        expect(event.title).to eq('Symbol Event')
        expect(event.description).to eq('Symbol Description')
      end
    end

    context 'with ActionController::Parameters rows' do
      let(:events_data) do
        [
          ActionController::Parameters.new(
            'title' => 'Parameters Event',
            'description' => 'Parameters Description',
            'date' => '2022-03-10'
          )
        ]
      end

      it 'normalizes them and creates events' do
        expect { service.call }.to change(Event, :count).by(1)

        event = Event.last
        expect(event.title).to eq('Parameters Event')
        expect(event.description).to eq('Parameters Description')
      end
    end

    context 'with missing description' do
      let(:events_data) do
        [
          {
            'title' => 'No Description Event',
            'date' => '2023-01-01'
          }
        ]
      end

      it 'creates event with empty description' do
        service.call

        event = Event.last
        expect(event.description).to eq('')
      end
    end

    context 'with invalid date' do
      let(:events_data) do
        [
          {
            'title' => 'Invalid Date Event',
            'date' => 'not-a-date'
          }
        ]
      end

      it 'creates event with nil fuzzy date' do
        service.call

        event = Event.last
        expect(event).to be_present
        expect(event.start_date).to be_nil
        expect(event.end_date).to be_nil
      end
    end

    context 'with empty events_data' do
      let(:events_data) { [] }

      it 'does not create any events' do
        expect { service.call }.not_to change(Event, :count)
      end
    end

    context 'when event creation fails' do
      before do
        allow_any_instance_of(Event).to receive(:update!).and_raise(ActiveRecord::RecordInvalid)
      end

      it 'skips the invalid events' do
        expect { service.call }.not_to change(Event, :count)
      end
    end

    context 'when called twice with the same payload' do
      it 'does not create duplicate events for the same source page and title' do
        expect {
          service.call
          service.call
        }.to change(Event, :count).by(2)
      end

      it 'updates the existing event instead of inserting a duplicate' do
        service.call

        updated_service = described_class.new(
          book: book,
          user_id: user.id,
          page_number: 12,
          events_data: [
            {
              'title' => 'Event 1',
              'description' => 'Updated Description',
              'date' => '2020-01-15'
            }
          ]
        )

        expect {
          updated_service.call
        }.not_to change(Event, :count)

        expect(Event.find_by!(source: book, page_number: 12, title: 'Event 1').description).to eq('Updated Description')
      end
    end

    context 'when one payload item is malformed' do
      let(:events_data) do
        [
          {
            'title' => 'Valid Event',
            'description' => 'Will be created',
            'date' => '2020-01-15'
          },
          'unexpected string payload'
        ]
      end

      it 'creates the valid events and skips the malformed one' do
        expect { service.call }.to change(Event, :count).by(1)
        expect(Event.find_by(title: 'Valid Event')).to be_present
      end
    end

    context 'when one payload item has no title' do
      let(:events_data) do
        [
          {
            'title' => 'Valid Event',
            'description' => 'Will be created',
            'date' => '2020-01-15'
          },
          {
            'title' => '',
            'description' => 'Missing title',
            'date' => '2020-01-16'
          }
        ]
      end

      it 'creates the valid events and skips the blank title row' do
        expect { service.call }.to change(Event, :count).by(1)
        expect(Event.find_by(title: 'Valid Event')).to be_present
      end
    end
  end
end
