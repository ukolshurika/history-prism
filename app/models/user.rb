# frozen_string_literal: true

class User < ApplicationRecord
  has_many :people
  has_many :events, foreign_key: 'creator_id'

  validates :email, presence: true, uniqueness: true
end