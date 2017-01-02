class CreateCategories < ActiveRecord::Migration[5.0]
  def change
    create_table :categories do |t|
      t.string :type
      t.string :category
      t.string :subcategory
      t.string :tax

      t.timestamps
    end
  end
end
