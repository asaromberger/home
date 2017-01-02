class CreatePermissions < ActiveRecord::Migration[5.0]
  def change
    create_table :permissions do |t|
      t.integer :user_id
      t.string :pkey
      t.hstore :pvalue

      t.timestamps
    end
  end
end
