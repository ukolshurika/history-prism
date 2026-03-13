# frozen_string_literal: true

class ConvertEventsToPolymorphicSource < ActiveRecord::Migration[8.0]
  def up
    # Add polymorphic columns
    add_column :events, :source_type, :string
    add_column :events, :source_id, :bigint

    # Migrate existing data
    execute <<-SQL
      UPDATE events
      SET source_type = 'GedcomFile', source_id = gedcom_file_id
      WHERE gedcom_file_id IS NOT NULL
    SQL

    # Add composite index for polymorphic association
    add_index :events, [:source_type, :source_id]

    # Remove old foreign key and column
    remove_foreign_key :events, :gedcom_files
    remove_index :events, :gedcom_file_id
    remove_column :events, :gedcom_file_id
  end

  def down
    # Add back gedcom_file_id column
    add_column :events, :gedcom_file_id, :bigint
    add_index :events, :gedcom_file_id

    # Migrate data back
    execute <<-SQL
      UPDATE events
      SET gedcom_file_id = source_id
      WHERE source_type = 'GedcomFile'
    SQL

    # Add back foreign key
    add_foreign_key :events, :gedcom_files

    # Remove polymorphic columns
    remove_index :events, [:source_type, :source_id]
    remove_column :events, :source_type
    remove_column :events, :source_id
  end
end
