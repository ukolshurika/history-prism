# frozen_string_literal: true

class FixGedcomUuidUniqueIndex < ActiveRecord::Migration[8.0]
  def change
    remove_index :people, :gedcom_uuid
    add_index :people, %i[gedcom_uuid gedcom_file_id], unique: true
  end
end
