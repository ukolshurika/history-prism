# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Book::UploadWorker, type: :worker do
  let(:user) { create(:user) }
  let(:book) { create(:book, creator: user) }
  let(:blob_key) { book.attachment.attachment.key }
  let(:worker) { described_class.new }
  let(:callback_url) { "http://example.com/books/#{book.id}/events" }

  describe '#perform' do
    context 'when book exists' do
      before do
        allow(BookApi).to receive(:process)
        allow(Rails.application.routes.url_helpers).to receive(:book_events_url)
          .and_return(callback_url)
      end

      it 'calls BookApi.process with correct arguments' do
        worker.perform(book.id)

        expect(BookApi).to have_received(:process).with(blob_key, book.id, callback_url)
      end

      it 'builds the correct callback URL' do
        worker.perform(book.id)

        expect(Rails.application.routes.url_helpers).to have_received(:book_events_url)
          .with(book, host: BookClient.url)
      end

      it 'does not raise an error' do
        expect { worker.perform(book.id) }.not_to raise_error
      end
    end

    context 'when book does not exist' do
      let(:invalid_book_id) { 99_999 }

      it 'raises ActiveRecord::RecordNotFound' do
        expect { worker.perform(invalid_book_id) }.to raise_error(ActiveRecord::RecordNotFound)
      end

      it 'does not call BookApi.process' do
        allow(BookApi).to receive(:process)

        begin
          worker.perform(invalid_book_id)
        rescue ActiveRecord::RecordNotFound
          # Expected error
        end

        expect(BookApi).not_to have_received(:process)
      end
    end

    context 'when API returns error' do
      before do
        allow(BookApi).to receive(:process).and_raise(
          BookApi::Transport::ClientError.new('422 Invalid PDF format')
        )
        allow(Rails.logger).to receive(:error)
      end

      it 'raises BookApi::Transport::ClientError' do
        expect { worker.perform(book.id) }.to raise_error(
          BookApi::Transport::ClientError,
          '422 Invalid PDF format'
        )
      end

      it 'logs the worker failure before re-raising' do
        expect { worker.perform(book.id) }.to raise_error(BookApi::Transport::ClientError)

        expect(Rails.logger).to have_received(:error).with(
          include('Books::UploadWorker', '422 Invalid PDF format')
        )
      end
    end

    context 'when network error occurs' do
      before do
        allow(BookApi).to receive(:process).and_raise(
          BookApi::Transport::Error.new('Connection refused')
        )
      end

      it 'raises BookApi::Transport::Error' do
        expect { worker.perform(book.id) }.to raise_error(
          BookApi::Transport::Error,
          'Connection refused'
        )
      end
    end

    context 'when book has no attachment' do
      before do
        book.attachment.purge
      end

      it 'raises an error' do
        expect { worker.perform(book.id) }.to raise_error
      end
    end
  end
end
