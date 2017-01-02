class RenameTypeFromCategory < ActiveRecord::Migration[5.0]
  def change
  	rename_column :categories, :type, :ctype
  end
end
