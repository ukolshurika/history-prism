class AddNameToPerson < ActiveRecord::Migration[8.0]
  def change
    add_column :people, :name, :string, null: false
    change_column_null :people, :first_name, false
  end
end
