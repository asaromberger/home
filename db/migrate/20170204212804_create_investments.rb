class CreateInvestments < ActiveRecord::Migration[5.0]
  def change
    create_table :investments do |t|
      t.integer :account_id
      t.date :date
      t.decimal :value
      t.decimal :shares
      t.decimal :pershare
      t.decimal :guaranteed

      t.timestamps
    end
  end
end
