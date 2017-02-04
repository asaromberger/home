class CreateAccounts < ActiveRecord::Migration[5.0]
  def change
    create_table :accounts do |t|
      t.string :account
      t.string :atype

      t.timestamps
    end
  end
end
