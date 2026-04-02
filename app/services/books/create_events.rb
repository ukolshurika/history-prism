# frozen_string_literal: true

module Books
  class CreateEvents
    params = -> {
      option :book
      option :events_data
      option :user_id
      option :page_number, optional: true
    }

    include Dry::Initializer.define params

    def call
      Array(events_data).each_with_index do |event_data, index|
        create_event(event_data, index)
      end
    end

    private

    def create_event(event_data, index)
      event_data = normalize_event_data(event_data)
      unless event_data
        log_skipped_event(index, event_data, 'payload is not an object')
        return
      end

      if event_data[:title].blank?
        log_skipped_event(index, event_data, 'title is blank')
        return
      end

      event = find_or_initialize_event(event_data)
      event.update!(
        description: event_data[:description] || '',
        category: :local,
        creator_id: user_id,
        start_date: build_fuzzy_date(event_data[:date]),
        end_date: build_fuzzy_date(event_data[:end_date] || event_data[:date])
      )
      event
    rescue ActiveRecord::RecordInvalid => e
      log_skipped_event(index, event_data, e.record.errors.full_messages.to_sentence)
      nil
    end

    def find_or_initialize_event(event_data)
      Event.find_or_initialize_by(
        source: book,
        page_number: page_number,
        title: event_data[:title]
      ).tap do |event|
        event.creator_id ||= user_id
      end
    end

    def build_fuzzy_date(date_string)
      return nil if date_string.blank?

      attrs = Books::DateParser.new(date_string).parse
      return nil unless attrs

      FuzzyDate.find_or_create_by!(original_text: attrs[:original_text]) do |fd|
        fd.assign_attributes(attrs.except(:original_text))
      end
    end

    def normalize_event_data(event_data)
      raw_hash =
        if event_data.respond_to?(:to_unsafe_h)
          event_data.to_unsafe_h
        elsif event_data.respond_to?(:to_h)
          event_data.to_h
        else
          event_data
        end

      return unless raw_hash.respond_to?(:deep_symbolize_keys)

      raw_hash.deep_symbolize_keys
    end

    def log_skipped_event(index, event_data, reason)
      Rails.logger.warn(
        "Books::CreateEvents skipped event at index #{index} for book #{book.id}: #{reason}. Payload: #{event_data.inspect}"
      )
    end
  end
end
