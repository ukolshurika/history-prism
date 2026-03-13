# frozen_string_literal: true

class Location < ApplicationRecord
  has_many :events
  validates :place, presence: true
end
