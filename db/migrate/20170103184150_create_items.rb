class CreateItems < ActiveRecord::Migration[5.0]
  def change
    create_table :items do |t|
      t.date :date
      t.string :pm
      t.string :checkno
      t.integer :what_id
      t.decimal :amount

      t.timestamps
    end
  end
end
