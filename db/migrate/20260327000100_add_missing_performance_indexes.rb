# frozen_string_literal: true

class AddMissingPerformanceIndexes < ActiveRecord::Migration[8.0]
  def change
    add_index :events, :category
    add_index :people, %i[first_name last_name]
    add_index :fuzzy_dates, :year
    add_index :locations, :place
  end
end
