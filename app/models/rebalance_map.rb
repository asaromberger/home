class RebalanceMap < ApplicationRecord
	belongs_to :rebalance_type
	belongs_to :account
end
