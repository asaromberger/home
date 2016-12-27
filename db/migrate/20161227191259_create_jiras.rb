class CreateJiras < ActiveRecord::Migration[5.0]
  def change
    create_table :jiras do |t|
      t.string :summary
      t.text :status
      t.string :description

      t.timestamps
    end
  end
end
