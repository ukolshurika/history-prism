# frozen_string_literal: true

class Book < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  has_one_attached :attachment
  has_many :events, as: :source, dependent: :destroy

  validates :creator, presence: true
  validates :attachment, presence: true
validate :attachment_must_be_pdf

  def self.ransackable_attributes(auth_object = nil)
    %w[id creator_id name location latitude longitude created_at updated_at]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[attachment_attachment attachment_blob creator events]
  end

  private

  def attachment_must_be_pdf
    return unless attachment.attached?

    unless attachment.filename.to_s.end_with?('.pdf')
      errors.add(:attachment, 'must be a PDF file')
    end
  end
end
