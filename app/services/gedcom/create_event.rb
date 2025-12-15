# frozen_string_literal: true

module Gedcom
  class CreateEvent
    params = -> {
      param :gedcom_event, GedcomApi::Event
      param :person
      param :user_id
    }

    include Dry::Initializer.define params

    def call
      event.tap do |e|
        e.update!(normalize_attributes)
        e.people << person unless e.people.include?(person)
      end
    end

    private

    def event
      @event ||= Event.find_or_initialize_by(
        title: gedcom_event.name,
        start_date: fuzzy_date,
        category: :person
      )
    end

    def normalize_attributes
      {
        title: gedcom_event.name,
        category: :person,
        creator_id: user_id,
        description: description_text,
        start_date: fuzzy_date,
        end_date: fuzzy_date
      }
    end

    def description_text
      parts = [gedcom_event.description]
      parts << "Place: #{gedcom_event.place}" if gedcom_event.place.present?
      parts << "Notes: #{format_notes}" if gedcom_event.notes.present?
      parts.compact.join("\n\n")
    end

    def format_notes
      case gedcom_event.notes
      when Array
        gedcom_event.notes.join("\n")
      when String
        gedcom_event.notes
      else
        gedcom_event.notes.to_s
      end
    end

    def fuzzy_date
      @fuzzy_date ||= begin
        parsed = DateParser.new(gedcom_event.date).to_fuzzy_date
        parsed&.save!
        parsed
      end
    end
  end
end
