# frozen_string_literal: true

class TimelineSerializer < ActiveModel::Serializer
  attributes :id, :title, :visible, :start_at, :end_at, :created_at, :updated_at,
             :person_id, :person_name, :cached_events_for_display, :event_configuration,
             :categorized_events, :pdf_url, :pdf_generated_at

  def person_name
    object.person&.name || "#{object.person&.given_name} #{object.person&.surname}".strip
  end

  def categorized_events
    person_event_ids = object.cached_events_for_display['person'] || []
    local_event_ids = object.cached_events_for_display['local'] || []
    world_event_ids = object.cached_events_for_display['world'] || []
    country_event_ids = object.cached_events_for_display['country'] || []

    {
      personal: serialize_events(Event.where(id: person_event_ids)),
      local: serialize_events(Event.where(id: local_event_ids)),
      world: serialize_events(Event.where(id: world_event_ids + country_event_ids))
    }
  end

  private

  def serialize_events(events)
    events.joins(:start_date)
      .order('fuzzy_dates.earliest_gregorian ASC')
      .includes(:end_date)
      .map do |event|
      {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        start_year: event.start_date&.year,
        start_month: event.start_date&.month,
        start_day: event.start_date&.day,
        end_year: event.end_date&.year,
        end_month: event.end_date&.month,
        end_day: event.end_date&.day,
        start_date_text: "#{event.start_date.date_type} #{event.start_date.slice(:year, :month,
                                                                                 :day).values.compact.join('-')}",
        end_date_text: event.end_date&.original_text,
        date_type: event.start_date&.date_type,
        is_multi_year: event.start_date&.year != event.end_date&.year
      }
    end
  end
end
