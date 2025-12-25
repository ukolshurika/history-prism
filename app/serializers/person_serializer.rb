# frozen_string_literal: true

class PersonSerializer < ActiveModel::Serializer
  attributes :id, :name, :first_name, :middle_name, :last_name, :full_name, :gedcom_uuid, :created_at, :updated_at,
             :birth_year, :death_year, :timelines

  has_many :events, serializer: EventSerializer

  def full_name
    [object.first_name, object.middle_name, object.last_name].compact.join(' ')
  end

  def birth_year
    birth_event = object.events.find { |e| e.title == 'Birth' }
    birth_event&.start_date&.year
  end

  def death_year
    death_event = object.events.find { |e| e.title == 'Death' }
    death_event&.start_date&.year
  end

  def timelines
    object.timelines.map do |timeline|
      {
        id: timeline.id,
        title: timeline.title
      }
    end
  end
end
