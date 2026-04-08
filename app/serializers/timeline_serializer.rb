# frozen_string_literal: true

class TimelineSerializer < ActiveModel::Serializer
  attributes :id, :title, :visible, :start_at, :end_at, :created_at, :updated_at,
             :person_id, :person_name, :cached_events_for_display, :event_configuration,
             :categorized_events, :pdf_url, :pdf_generated_at, :processing_status,
             :processing_error, :pdf_status, :pdf_error

  def person_name
    object.person&.name.presence || "#{object.person&.first_name} #{object.person&.last_name}".strip
  end

  def categorized_events
    person_event_ids = object.cached_events_for_display['person'] || []
    local_event_ids = object.cached_events_for_display['local'] || []
    world_event_ids = object.cached_events_for_display['world'] || []
    country_event_ids = object.cached_events_for_display['country'] || []

    {
      personal: serialize_events(visible_events_for(person_event_ids)),
      local: serialize_events(visible_events_for(local_event_ids)),
      world: serialize_events(visible_events_for(world_event_ids + country_event_ids))
    }
  end

  private

  def visible_events_for(event_ids)
    Event.where(id: event_ids).visible_to(Current.user)
  end

  def serialize_events(events)
    events.joins(:start_date)
      .order('fuzzy_dates.earliest_gregorian ASC')
      .includes(:end_date, :source)
      .map do |event|
      serializer = EventSerializer.new(event)

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
        start_date_text: format_timeline_date(event.start_date),
        end_date_text: format_timeline_date(event.end_date),
        date_type: event.start_date&.date_type,
        is_multi_year: event.start_date&.year != event.end_date&.year,
        source_url: serializer.source_url
      }
    end
  end

  def format_timeline_date(fuzzy_date)
    return nil unless fuzzy_date

    year = fuzzy_date.year
    month = fuzzy_date.month
    day = fuzzy_date.day

    return format('%<day>02d/%<month>02d/%<year>04d', day:, month:, year:) if day.present? && month.present?
    return format('%<month>02d/%<year>04d', month:, year:) if month.present?

    year.to_s
  end
end
