class CreateSummaryTypes < ActiveRecord::Migration[5.0]
  def change
    create_table :summary_types do |t|
      t.string :stype
      t.integer :priority

      t.timestamps
    end
  end
end
