# frozen_string_literal: true

class CreateFuzzyDates < ActiveRecord::Migration[8.0]
  def change
    create_table :fuzzy_dates do |t|
      t.string  :original_text, null: false
      t.integer :date_type, default: 0
      t.integer :calendar_type, default: 0

      t.integer :year
      t.integer :month
      t.integer :day
      t.integer :year_end
      t.integer :month_end
      t.integer :day_end

      t.date    :earliest_gregorian
      t.date    :latest_gregorian
      t.date    :sort_value

      t.timestamps
    end

    add_index :fuzzy_dates, :sort_value

    remove_column :events, :start_date, :datetime
    remove_column :events, :end_date, :datetime

    add_reference :events, :start_date, foreign_key: { to_table: :fuzzy_dates }
    add_reference :events, :end_date, foreign_key: { to_table: :fuzzy_dates }
  end
end
