# frozen_string_literal: true

module BookApi
  Error = Class.new StandardError
  BOOK_PATH = '/book'

  module_function

  def process(blob_key, book_id, callback_url)
    Transport.post(BOOK_PATH, {
      blob_key: blob_key,
      book_id: book_id,
      callback_url: callback_url,
      language: 'ru'
    }).body
  end
end
