# frozen_string_literal: true

# Configure ransack for ActiveStorage models
Rails.application.config.to_prepare do
  ActiveStorage::Blob.class_eval do
    def self.ransackable_attributes(auth_object = nil)
      %w[filename content_type byte_size created_at]
    end
  end

  ActiveStorage::Attachment.class_eval do
    def self.ransackable_attributes(auth_object = nil)
      %w[name created_at]
    end

    def self.ransackable_associations(auth_object = nil)
      %w[blob]
    end
  end
end
