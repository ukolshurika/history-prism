class Timeline < ApplicationRecord
  belongs_to :person
  belongs_to :user

  validates :title, presence: true
  validates :person_id, presence: true
  validates :user_id, presence: true

  # Ransack configuration
  def self.ransackable_attributes(auth_object = nil)
    %w[id title visible user_id person_id start_at end_at created_at updated_at]
  end

  def self.ransackable_associations(auth_object = nil)
    %w[person user]
  end
end
