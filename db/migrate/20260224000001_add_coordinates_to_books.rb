class AddCoordinatesToBooks < ActiveRecord::Migration[8.0]
  def change
    add_column :books, :latitude, :decimal, precision: 10, scale: 6
    add_column :books, :longitude, :decimal, precision: 10, scale: 6
  end
end
