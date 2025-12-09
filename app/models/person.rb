# frozen_string_literal: true

class Person < ApplicationRecord
  belongs_to :user
  belongs_to :gedcom_file, optional: true
  has_and_belongs_to_many :events
  has_many :timelines, dependent: :destroy
  accepts_nested_attributes_for :events, allow_destroy: true, reject_if: :all_blank

  validates :name, presence: true
  validates :first_name, presence: true
  validates :middle_name, presence: false
  validates :last_name, presence: false
  validates :gedcom_uuid, presence: true, uniqueness: true
  validate :events_must_be_person_type

  # Ransack configuration
  def self.ransackable_attributes(auth_object = nil)
    %w[name first_name middle_name last_name gedcom_file_id]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[gedcom_file]
  end

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