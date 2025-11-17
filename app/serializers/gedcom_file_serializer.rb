# frozen_string_literal: true

class GedcomFileSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :created_at, :updated_at, :file_name, :file_url

  def file_name
    object.file.filename.to_s if object.file.attached?
  end

  def file_url
    Rails.application.routes.url_helpers.rails_blob_path(object.file, only_path: true) if object.file.attached?
  end
end
