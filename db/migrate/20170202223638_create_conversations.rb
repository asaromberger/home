class CreateConversations < ActiveRecord::Migration[5.0]
  def change
    create_table :conversations do |t|
      t.integer :person_id
      t.date :date
      t.text :note
      t.date :scheduled

      t.timestamps
    end
  end
end
