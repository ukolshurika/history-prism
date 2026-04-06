# frozen_string_literal: true

class EventSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :start_date, :end_date, :category, :person_ids,
             :created_at, :updated_at, :source_type, :source_id, :source_name,
             :page_number, :start_date_display, :end_date_display, :start_date_sort,
             :start_date_attributes, :end_date_attributes, :source_attachment_url,
             :creator

  has_many :people, serializer: PersonSerializer
  has_one :location, serializer: LocationSerializer

  def creator
    return nil unless object.creator

    {
      id: object.creator.id,
      email: object.creator.email
    }
  end

  def person_ids
    object.people.pluck(:id)
  end

  def source_attachment_url
    return nil unless object.source_type == 'Book'
    return nil unless object.source&.attachment&.attached?

    Rails.application.routes.url_helpers.rails_blob_path(object.source.attachment, only_path: true)
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

  def start_date_display
    object.start_date&.original_text
  end

  def start_date_sort
    object.start_date&.sort_value
  end

  def end_date_display
    object.end_date&.original_text
  end

  def start_date_attributes
    serialize_fuzzy_date(object.start_date)
  end

  def end_date_attributes
    serialize_fuzzy_date(object.end_date)
  end

  private

  def serialize_fuzzy_date(fuzzy_date)
    return nil unless fuzzy_date

    {
      original_text: fuzzy_date.original_text,
      date_type: fuzzy_date.date_type,
      year: fuzzy_date.year,
      month: fuzzy_date.month,
      day: fuzzy_date.day,
      year_end: fuzzy_date.year_end,
      month_end: fuzzy_date.month_end,
      day_end: fuzzy_date.day_end,
      calendar_type: fuzzy_date.calendar_type
    }
  end
end
