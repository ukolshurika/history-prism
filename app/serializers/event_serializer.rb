# frozen_string_literal: true

class EventSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :start_date, :end_date, :category, :person_ids, :created_at, :updated_at

  has_one :creator, serializer: CreatorSerializer
  has_many :people, serializer: PersonSerializer

  def person_ids
    object.people.pluck(:id)
  end
end
