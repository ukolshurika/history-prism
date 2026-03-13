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
      events_data.each do |event_data|
        create_event(event_data)
      end
    end

    private

    def create_event(event_data)
      Event.create!(
        title: event_data['title'] || event_data[:title],
        description: event_data['description'] || event_data[:description] || '',
        category: :local,
        creator_id: user_id,
        source: book,
        page_number: page_number,
        start_date: build_fuzzy_date(event_data['date'] || event_data[:date]),
        end_date: build_fuzzy_date(event_data['end_date'] || event_data[:end_date] || event_data['date'] || event_data[:date])
      )
    end

    def build_fuzzy_date(date_string)
      return nil if date_string.blank?

      attrs = Books::DateParser.new(date_string).parse
      return nil unless attrs

      FuzzyDate.find_or_create_by!(original_text: attrs[:original_text]) do |fd|
        fd.assign_attributes(attrs.except(:original_text))
      end
    end
  end
end
