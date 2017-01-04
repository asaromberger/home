class AddPriorityToJira < ActiveRecord::Migration[5.0]
  def change
    add_column :jiras, :priority, :integer
  end
end
