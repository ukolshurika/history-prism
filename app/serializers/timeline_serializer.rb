# frozen_string_literal: true

class TimelineSerializer < ActiveModel::Serializer
  attributes :id, :title, :visible, :start_at, :end_at, :created_at, :updated_at,
             :person_id, :person_name, :cached_events_for_display, :event_configuration

  def person_name
    object.person&.name || "#{object.person&.given_name} #{object.person&.surname}".strip
  end
end
