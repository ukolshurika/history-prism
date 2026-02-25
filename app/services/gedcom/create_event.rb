# frozen_string_literal: true

module Gedcom
  class CreateEvent
    params = -> {
      param :gedcom_event, GedcomApi::Event
      param :person
      param :user_id
      param :gedcom_file_id
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
      @event ||= find_existing_event || Event.new
    end

    def find_existing_event
      # Find existing event by title, source, and person association
      Event.joins(:people)
           .where(
             title: gedcom_event.name,
             source_type: 'GedcomFile',
             source_id: gedcom_file_id,
             category: :person,
             people: { id: person.id }
           )
           .first
    end

    def normalize_attributes
      {
        title: gedcom_event.name,
        category: :person,
        creator_id: user_id,
        source: GedcomFile.find(gedcom_file_id),
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
        attrs = DateParser.new(gedcom_event.date).parse
        return nil unless attrs

        # Find existing FuzzyDate by original_text to avoid duplicates
        FuzzyDate.find_or_create_by!(original_text: attrs[:original_text]) do |fd|
          fd.assign_attributes(attrs.except(:original_text))
        end
      end
    end
  end
end
