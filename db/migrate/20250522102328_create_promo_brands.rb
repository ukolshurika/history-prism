# frozen_string_literal: true

class CreatePromoBrands < ActiveRecord::Migration[6.0]
  def change
    create_table :brands do |t|
      t.string :name, null: false, unique: true, index: true
      t.string :callback
      t.string :secret, null: false
      t.string :token, null: false

      t.timestamps
    end

    execute <<-SQL.squish
    INSERT INTO brands
      (name, secret,token, callback, created_at, updated_at)
      VALUES
      ('everum', 'a50ab99f-cd46-4bf0-a087-cc876aac03fe', 'iipjP8wyag0BwLRa', 'http://puma:9292', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('vibe', "#{SecureRandom.uuid}", 'vibe-token', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
      ('adilplay', "#{SecureRandom.uuid}", 'adilplay-token', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    SQL
  end
end
