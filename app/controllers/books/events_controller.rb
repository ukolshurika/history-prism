# frozen_string_literal: true

module Books
  class EventsController < ActionController::API
    include SignatureValidation

    def create
      book = Book.find(params[:book_id])

      Books::CreateEvents.new(
        book: book,
        events_data: params[:events] || [],
        user_id: book.creator_id,
        page_number: params[:page_number]
      ).call

      render json: { success: true }, status: :created
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Book not found' }, status: :not_found
    rescue StandardError => e
      Rails.logger.error("Book::CreateEvents failed: #{e.message}")
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end
end
