# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Books::Events', type: :request do
  let(:user) { create(:user) }
  let(:book) { create(:book, creator: user) }
  let(:callback_secret) { 'book_callback_secret' }

  before do
    allow(BookClient).to receive(:callback_secret).and_return(callback_secret)
  end

  def generate_signature(body)
    OpenSSL::HMAC.hexdigest('SHA256', callback_secret, body.to_json)
  end

  describe 'POST /books/:book_id/events' do
    let(:events_data) do
      [
        {
          title: 'World War II Ended',
          description: 'Victory in Europe Day',
          date: '1945-05-08'
        },
        {
          title: 'Moon Landing',
          description: 'First humans on the moon',
          date: '1969-07-20'
        }
      ]
    end

    let(:valid_params) do
      {
        book_id: book.id,
        events: events_data
      }
    end

    context 'with valid signature' do
      it 'creates events for the book' do
        signature = generate_signature(valid_params)

        expect {
          post book_events_path(book),
               params: valid_params.to_json,
               headers: {
                 'Content-Type' => 'application/json',
                 'X-Signature' => signature
               }
        }.to change(Event, :count).by(2)

        expect(response).to have_http_status(:created)
        expect(JSON.parse(response.body)['success']).to be true

        events = book.events.reload
        expect(events.count).to eq(2)
        expect(events.pluck(:title)).to contain_exactly('World War II Ended', 'Moon Landing')
        expect(events.first.source_type).to eq('Book')
        expect(events.first.source_id).to eq(book.id)
      end

      it 'creates fuzzy dates for events' do
        signature = generate_signature(valid_params)

        post book_events_path(book),
             params: valid_params.to_json,
             headers: {
               'Content-Type' => 'application/json',
               'X-Signature' => signature
             }

        event = Event.find_by(title: 'World War II Ended')
        expect(event.start_date).to be_present
        expect(event.start_date.year).to eq(1945)
        expect(event.start_date.month).to eq(5)
        expect(event.start_date.day).to eq(8)
      end

      it 'sets the creator_id to book creator' do
        signature = generate_signature(valid_params)

        post book_events_path(book),
             params: valid_params.to_json,
             headers: {
               'Content-Type' => 'application/json',
               'X-Signature' => signature
             }

        events = book.events.reload
        expect(events.pluck(:creator_id).uniq).to eq([user.id])
      end
    end

    context 'with invalid signature' do
      it 'returns unauthorized' do
        post book_events_path(book),
             params: valid_params.to_json,
             headers: {
               'Content-Type' => 'application/json',
               'X-Signature' => 'invalid_signature'
             }

        expect(response).to have_http_status(:unauthorized)
      end

      it 'does not create events' do
        expect {
          post book_events_path(book),
               params: valid_params.to_json,
               headers: {
                 'Content-Type' => 'application/json',
                 'X-Signature' => 'invalid_signature'
               }
        }.not_to change(Event, :count)
      end
    end

    context 'with missing signature' do
      it 'returns unauthorized' do
        post book_events_path(book),
             params: valid_params.to_json,
             headers: { 'Content-Type' => 'application/json' }

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with non-existent book' do
      it 'returns not found' do
        signature = generate_signature(valid_params)

        post book_events_path(book_id: 99999),
             params: valid_params.to_json,
             headers: {
               'Content-Type' => 'application/json',
               'X-Signature' => signature
             }

        expect(response).to have_http_status(:not_found)
      end
    end

    context 'with empty events array' do
      let(:empty_params) do
        {
          book_id: book.id,
          events: []
        }
      end

      it 'returns success without creating events' do
        signature = generate_signature(empty_params)

        expect {
          post book_events_path(book),
               params: empty_params.to_json,
               headers: {
                 'Content-Type' => 'application/json',
                 'X-Signature' => signature
               }
        }.not_to change(Event, :count)

        expect(response).to have_http_status(:created)
      end
    end

    context 'when the batch contains malformed rows' do
      let(:mixed_params) do
        {
          book_id: book.id,
          events: [
            {
              title: 'World War II Ended',
              description: 'Victory in Europe Day',
              date: '1945-05-08'
            },
            {
              title: '',
              description: 'Missing title',
              date: '1969-07-20'
            },
            'unexpected string payload'
          ]
        }
      end

      it 'creates valid events and still returns created' do
        signature = generate_signature(mixed_params)

        expect {
          post book_events_path(book),
               params: mixed_params.to_json,
               headers: {
                 'Content-Type' => 'application/json',
                 'X-Signature' => signature
               }
        }.to change(Event, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(book.events.reload.pluck(:title)).to eq(['World War II Ended'])
      end
    end
  end
end
