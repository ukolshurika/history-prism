# frozen_string_literal: true

module Books
  class UploadWorker
    include Sidekiq::Worker

    def perform(book_id)
      book = ::Book.find(book_id)
      blob_key = book.attachment.attachment.key
      callback_url = Rails.application.routes.url_helpers.book_events_url(book, host: BookClient.callback_host)

      BookApi.process(blob_key, book_id, callback_url)
    end

    private

    def default_host
      ENV.fetch('APP_HOST', 'localhost:3000')
    end
  end
end
