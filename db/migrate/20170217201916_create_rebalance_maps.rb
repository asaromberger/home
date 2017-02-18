class CreateRebalanceMaps < ActiveRecord::Migration[5.0]
  def change
    create_table :rebalance_maps do |t|
      t.integer :rebalance_type_id
      t.integer :account_id
      t.decimal :target

      t.timestamps
    end
  end
end
