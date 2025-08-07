# frozen_string_literal: true

class Person < ApplicationRecord
  belongs_to :user
  has_and_belongs_to_many :events

  validates :first_name, presence: true
  validates :middle_name, presence: false
  validates :last_name, presence: false
  validates :gedcom_uuid, presence: true, uniqueness: true
end