class ChangeStatusFromJiras < ActiveRecord::Migration[5.0]
  def change
  	change_column :jiras, :status, :string
  end
end
