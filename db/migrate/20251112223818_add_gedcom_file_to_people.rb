class AddGedcomFileToPeople < ActiveRecord::Migration[8.0]
  def change
    add_reference :people, :gedcom_file, foreign_key: true
  end
end
