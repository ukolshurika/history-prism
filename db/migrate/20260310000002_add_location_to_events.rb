# frozen_string_literal: true

class AddLocationToEvents < ActiveRecord::Migration[8.0]
  def change
    add_reference :events, :location, foreign_key: true, null: true
  end
end
