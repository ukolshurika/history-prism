class CreateTimelines < ActiveRecord::Migration[8.0]
  def change
    create_table :timelines do |t|
      t.references :person, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.boolean :visible, default: false, null: false
      t.string :title, null: false
      t.datetime :start_at
      t.datetime :end_at
      t.jsonb :event_configuration, default: {}
      t.jsonb :cached_events_for_display, default: {}

      t.timestamps
    end

    add_index :timelines, :visible
    add_index :timelines, :start_at
    add_index :timelines, :end_at
  end
end
