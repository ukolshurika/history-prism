class AddGedcomFileToEvents < ActiveRecord::Migration[8.0]
  def change
    add_reference :events, :gedcom_file, foreign_key: true
  end
end
