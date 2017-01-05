class CreateWhatMaps < ActiveRecord::Migration[5.0]
  def change
    create_table :what_maps do |t|
      t.text :what
      t.string :what_id

      t.timestamps
    end
  end
end
