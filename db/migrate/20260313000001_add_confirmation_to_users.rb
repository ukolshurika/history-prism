class AddConfirmationToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :email_confirmation_token, :string
    add_column :users, :confirmed_at, :datetime
    add_index :users, :email_confirmation_token, unique: true
  end
end
