# frozen_string_literal: true

class Event < ApplicationRecord
  include PgSearch::Model

  enum :category, { person: 0, world: 1, country: 2, local: 3 }

  belongs_to :creator, class_name: 'User'
  belongs_to :source, polymorphic: true, optional: true
  belongs_to :start_date, class_name: 'FuzzyDate', optional: true
  belongs_to :end_date, class_name: 'FuzzyDate', optional: true
  belongs_to :location, optional: true

  has_and_belongs_to_many :people
  accepts_nested_attributes_for :people, allow_destroy: true, reject_if: :all_blank
  accepts_nested_attributes_for :location, reject_if: :all_blank

  pg_search_scope :search_full_text,
    against: { title: 'A', description: 'B' },
    using: {
      tsearch: { dictionary: 'russian', prefix: true, any_word: true }
    }

  scope :publicly_visible, -> { where.not(category: categories[:person]) }
  scope :visible_to, ->(user) do
    user.present? ? publicly_visible.or(where(creator_id: user.id)) : publicly_visible
  end

  scope :sorted_by_date, ->(direction = 'asc') do
    dir = normalize_sort_direction(direction)

    joins("LEFT JOIN fuzzy_dates ON fuzzy_dates.id = events.start_date_id")
      .order(Arel.sql("fuzzy_dates.sort_value #{dir} NULLS LAST"))
  end

  scope :sorted_by_place, ->(direction = 'asc') do
    dir = normalize_sort_direction(direction)

    joins("LEFT JOIN locations ON locations.id = events.location_id")
      .order(Arel.sql("locations.place #{dir} NULLS LAST"))
  end

  validates :title, presence: true
  validates :category, presence: true

  before_validation :set_default_end_date
  validate :end_date_after_start_date

  private

  def self.normalize_sort_direction(direction)
    direction == 'desc' ? 'DESC' : 'ASC'
  end

  def set_default_end_date
    self.end_date = start_date if end_date.blank? && start_date.present?
  end

  def end_date_after_start_date
    return unless start_date && end_date

    errors.add(:end_date, 'must be after start date') if end_date < start_date
  end
end
