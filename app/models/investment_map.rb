class InvestmentMap < ApplicationRecord
	belongs_to :account
	belongs_to :summary_type
end
