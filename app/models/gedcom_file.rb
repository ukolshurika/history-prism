class GedcomFile < ApplicationRecord
  belongs_to :user
  has_one_attached :file

  has_many :events, as: :source, dependent: :nullify
  has_many :people, dependent: :nullify

  validates :file, presence: true
  validate :file_must_be_ged

  # Ransack configuration
  def self.ransackable_attributes(auth_object = nil)
    %w[id user_id created_at updated_at]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[file_attachment file_blob]
  end

  private

  def file_must_be_ged
    if file.attached? && !file.filename.to_s.end_with?('.ged')
      errors.add(:file, 'must be a .ged file')
    end
  end
end
