class DropJiras < ActiveRecord::Migration[6.0]
  def change
  	drop_table :jiras
  end
end
