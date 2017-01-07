class RenameWhatFromWhatMaps < ActiveRecord::Migration[5.0]
  def change
  	rename_column :what_maps, :what, :whatmap
  end
end
