class Session < ApplicationRecord
  SESSION_TTL = 14.days

  belongs_to :user

  def expired?
    created_at < SESSION_TTL.ago
  end
end
