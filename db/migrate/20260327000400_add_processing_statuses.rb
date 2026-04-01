# frozen_string_literal: true

class AddProcessingStatuses < ActiveRecord::Migration[8.0]
  def change
    add_column :gedcom_files, :processing_status, :string, null: false, default: 'queued'
    add_column :gedcom_files, :processing_error, :text

    add_column :timelines, :processing_status, :string, null: false, default: 'queued'
    add_column :timelines, :processing_error, :text
    add_column :timelines, :pdf_status, :string, null: false, default: 'idle'
    add_column :timelines, :pdf_error, :text
  end
end
