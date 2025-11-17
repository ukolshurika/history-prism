class GedcomFile < ApplicationRecord
  belongs_to :user
  has_one_attached :file

  has_many :events, dependent: :nullify
  has_many :people, dependent: :nullify

  validates :file, presence: true
  validate :file_must_be_ged

  private

  def file_must_be_ged
    if file.attached? && !file.filename.to_s.end_with?('.ged')
      errors.add(:file, 'must be a .ged file')
    end
  end
end
