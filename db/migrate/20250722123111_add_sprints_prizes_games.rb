# frozen_string_literal: true

class AddSprintsPrizesGames < ActiveRecord::Migration[8.0]
  def change
    create_table :sprints do |t|
      t.string :title, null: false
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.string :scoring_mode, null: false
      t.integer :spins_to_qualify, default: 100, null: false
      t.string :bet_limit
      t.datetime :completed_at
      t.integer :spins_to_reset, default: 25, null: false
      t.string :game_source, limit: 16, default: 'list', null: false
      t.string :game_tag, default: 'slot'
      t.timestamps

      t.index [:completed_at], name: 'index_sprints_on_completed_at'
      t.index %w[starts_at ends_at],
              name: 'index_sprints_on_starts_at_and_ends_at'
    end

    create_table :sprint_vendors do |t|
      t.integer :sprint_id, index: true
      t.string :vendor, limit: 32, null: false
      t.timestamps
    end

    create_table :casino_games do |t|
      t.string :source_id, null: false, index: true
      t.string :code, null: false, index: true
      t.timestamps
    end

    create_table :prizes do |t|
      t.string :owner_type, null: false
      t.bigint :owner_id, null: false
      t.integer :places_from, null: false
      t.integer :places_to, null: false
      t.string :award_type, null: false
      t.string :award_value, limit: 1024, null: false
      t.timestamps

      t.index %w[owner_type owner_id],
              name: 'index_promo_prizes_on_owner_type_and_owner_id'
    end

    create_table :sprint_attempts do |t|
      t.bigint :user_id, null: false
      t.bigint :sprint_id, null: false, index: true
      t.bigint :brand_id, null: false, index: true
      t.bigint :external_id, null: false
      t.decimal :score, precision: 14, scale: 2, default: 0.0, null: false

      t.timestamps
    end

    create_table :brands_sprints do |t|
      t.references :brands
      t.references :sprint
      t.datetime :completed_at
      t.datetime :delivery_at
      t.integer :external_id

      t.timestamps
    end
  end
end
