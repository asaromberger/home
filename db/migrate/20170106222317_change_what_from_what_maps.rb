class ChangeWhatFromWhatMaps < ActiveRecord::Migration[5.0]
  def change
  	change_column :what_maps, :what, :string
	remove_column :what_maps, :what_id, :string
	add_column :what_maps, :what_id, :integer
  end
end
