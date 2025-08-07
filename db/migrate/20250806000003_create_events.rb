# frozen_string_literal: true

class CreateEvents < ActiveRecord::Migration[6.0]
  def change
    create_table :events do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.datetime :start_date, null: false
      t.datetime :end_date, null: false
      t.integer :category, null: false
      t.references :creator, null: false, foreign_key: { to_table: :users }
      
      t.timestamps
    end
  end
end