# frozen_string_literal: true

class PersonSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :middle_name, :last_name, :full_name, :gedcom_uuid, :created_at, :updated_at

  has_many :events, serializer: EventSerializer

  def full_name
    [object.first_name, object.middle_name, object.last_name].compact.join(' ')
  end
end
