# frozen_string_literal: true

class Person < ApplicationRecord
  belongs_to :user
  belongs_to :gedcom_file, optional: true
  has_and_belongs_to_many :events
  accepts_nested_attributes_for :events, allow_destroy: true, reject_if: :all_blank

  validates :first_name, presence: true
  validates :middle_name, presence: false
  validates :last_name, presence: false
  validates :gedcom_uuid, presence: true, uniqueness: true
  validate :events_must_be_person_type

  private

  def events_must_be_person_type
    events.each do |event|
      unless event.person? || event.category.nil?
        errors.add(:events, "must be of type 'person'")
        break
      end
    end
  end
end