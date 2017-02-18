class Account < ApplicationRecord
	has_many :investment_maps
	has_many :investments
	has_many :rebalance_maps
end
