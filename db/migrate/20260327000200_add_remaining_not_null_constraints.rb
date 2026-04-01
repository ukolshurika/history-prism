# frozen_string_literal: true

class AddRemainingNotNullConstraints < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      DELETE FROM sessions
      WHERE user_id IS NULL
    SQL

    execute <<~SQL.squish
      UPDATE locations
      SET place = 'Unknown location'
      WHERE place IS NULL OR place = ''
    SQL

    change_column_null :sessions, :user_id, false
    change_column_null :locations, :place, false
  end

  def down
    change_column_null :sessions, :user_id, true
    change_column_null :locations, :place, true
  end
end
