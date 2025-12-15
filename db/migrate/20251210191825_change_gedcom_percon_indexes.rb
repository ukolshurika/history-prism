# frozen_string_literal: true

class ChangeGedcomPerconIndexes < ActiveRecord::Migration[8.0]
  def change
    remove_index :people, :gedcon_uuid, name: :index_people_on_gedcom_uuid
    add_index :people, :gedcom_uuid
    add_index :people, %i(gedcom_uuid gedcom_file_id)
  end
end
