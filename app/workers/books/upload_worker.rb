# frozen_string_literal: true

module Books
  class UploadWorker
    include Sidekiq::Worker
    include WorkerErrorHandling

    def perform(book_id)
      with_worker_error_handling(book_id: book_id) do
        book = ::Book.find(book_id)
        blob_key = book.attachment.attachment.key
        callback_url = Rails.application.routes.url_helpers.book_events_url(book, host: BookClient.callback_host)

        BookApi.process(blob_key, book_id, callback_url)
      end
    end

    private

    def default_host
      ENV.fetch('APP_HOST', 'localhost:3000')
    end
  end
end
