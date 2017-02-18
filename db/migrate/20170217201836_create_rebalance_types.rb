class CreateRebalanceTypes < ActiveRecord::Migration[5.0]
  def change
    create_table :rebalance_types do |t|
      t.string :rtype

      t.timestamps
    end
  end
end
