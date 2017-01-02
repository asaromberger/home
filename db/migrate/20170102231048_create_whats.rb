class CreateWhats < ActiveRecord::Migration[5.0]
  def change
    create_table :whats do |t|
      t.string :what
      t.integer :category_id

      t.timestamps
    end
  end
end
