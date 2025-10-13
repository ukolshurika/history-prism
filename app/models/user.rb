class User < ApplicationRecord
  has_secure_password
  has_many :sessions, dependent: :destroy
  has_many :events, foreign_key: 'creator_id', dependent: :destroy

  normalizes :email, with: ->(e) { e.strip.downcase }
  validates :email,
            uniqueness: {
              case_sensitive: false
            },
            presence: true,
            format: {
              with: /@/,
              message: 'must be a valid email address'
            }
end
