class CreateInputs < ActiveRecord::Migration[5.0]
  def change
    create_table :inputs do |t|
      t.date :date
      t.string :pm
      t.string :checkno
      t.string :what
      t.decimal :amount

      t.timestamps
    end
  end
end
