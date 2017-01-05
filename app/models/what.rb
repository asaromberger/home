class What < ApplicationRecord
	
	belongs_to :category
	has_many :items
	has_many :what_maps

end
