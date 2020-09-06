class DropConversations < ActiveRecord::Migration[6.0]
  def change
  	drop_table :conversations
  end
end
