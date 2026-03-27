# frozen_string_literal: true

class AddUniqueIndexToFuzzyDatesOriginalText < ActiveRecord::Migration[8.0]
  def change
    add_index :fuzzy_dates, :original_text, unique: true
  end
end
