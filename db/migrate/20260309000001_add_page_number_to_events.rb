# frozen_string_literal: true

class AddPageNumberToEvents < ActiveRecord::Migration[8.0]
  def change
    add_column :events, :page_number, :integer
    add_index :events, [:source_type, :source_id, :page_number],
              name: 'index_events_on_source_and_page_number'
  end
end
