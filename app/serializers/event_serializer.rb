# frozen_string_literal: true

class EventSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :start_date, :end_date, :category, :person_ids,
             :created_at, :updated_at, :source_type, :source_id, :source_name

  has_one :creator, serializer: CreatorSerializer
  has_many :people, serializer: PersonSerializer

  def person_ids
    object.people.pluck(:id)
  end

  def source_name
    return nil unless object.source

    case object.source_type
    when 'GedcomFile'
      object.source.file.filename.to_s if object.source.file.attached?
    when 'Book'
      object.source.name.presence || object.source.attachment.filename.to_s if object.source.attachment.attached?
    end
  end
end
