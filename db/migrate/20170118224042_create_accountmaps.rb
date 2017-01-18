class CreateAccountmaps < ActiveRecord::Migration[5.0]
  def change
    create_table :accountmaps do |t|
      t.string :account
      t.string :ctype

      t.timestamps
    end
  end
end
