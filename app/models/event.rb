# frozen_string_literal: true

class Event < ApplicationRecord
  enum :category, { person: 0, world: 1, country: 2, local: 3 }

  belongs_to :creator, class_name: 'User'
  belongs_to :gedcom_file, optional: true
  belongs_to :start_date, class_name: 'FuzzyDate', optional: true
  belongs_to :end_date, class_name: 'FuzzyDate', optional: true

  has_and_belongs_to_many :people
  accepts_nested_attributes_for :people, allow_destroy: true, reject_if: :all_blank

  validates :title, presence: true
  validates :description, presence: true
  validates :start_date, presence: true
  validates :category, presence: true

  before_validation :set_default_end_date
  validate :end_date_after_start_date

  private

  def set_default_end_date
    self.end_date = start_date if end_date.blank? && start_date.present?
  end

  def end_date_after_start_date
    return unless start_date && end_date

    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end
end
