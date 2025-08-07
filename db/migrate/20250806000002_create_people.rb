# frozen_string_literal: true

class CreatePeople < ActiveRecord::Migration[6.0]
  def change
    create_table :people do |t|
      t.string :first_name, null: false
      t.string :middle_name
      t.string :last_name
      t.string :gedcom_uuid, null: false
      t.references :user, null: false, foreign_key: true
      
      t.timestamps
    end
    
    add_index :people, :gedcom_uuid, unique: true
  end
end