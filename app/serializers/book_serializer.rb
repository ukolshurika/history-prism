# frozen_string_literal: true

class BookSerializer < ActiveModel::Serializer
  attributes :id, :name, :location, :latitude, :longitude, :creator_id, :created_at, :updated_at,
             :attachment_name, :attachment_url, :events_count

  def attachment_name
    object.attachment.filename.to_s if object.attachment.attached?
  end

  def attachment_url
    Rails.application.routes.url_helpers.rails_blob_path(object.attachment, only_path: true) if object.attachment.attached?
  end

  def events_count
    object.events.count
  end
end
