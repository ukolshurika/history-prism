class AddPdfFieldsToTimelines < ActiveRecord::Migration[8.0]
  def change
    add_column :timelines, :pdf_url, :string
    add_column :timelines, :pdf_generated_at, :datetime
    add_index :timelines, :pdf_generated_at
  end
end
