# frozen_string_literal: true

class CreateBooks < ActiveRecord::Migration[8.0]
  def change
    create_table :books do |t|
      t.references :creator, null: false, foreign_key: { to_table: :users }
      t.string :name
      t.string :location

      t.timestamps
    end
  end
end
