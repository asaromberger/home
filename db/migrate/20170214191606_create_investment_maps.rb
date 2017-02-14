class CreateInvestmentMaps < ActiveRecord::Migration[5.0]
  def change
    create_table :investment_maps do |t|
      t.integer :account_id
      t.integer :summary_type_id

      t.timestamps
    end
  end
end
