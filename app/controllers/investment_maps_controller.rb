class InvestmentMapsController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def index
		@title = 'Manage Investment Maps'
		@investment_maps = InvestmentMap.joins(:summary_type, :account).all.order('summary_types.stype, accounts.account')
	end

	def new
		@title = 'New Investment Map'
		@investment_map = InvestmentMap.new
		@summary_types = SummaryType.all.order('stype')
		@accounts = Account.all.order('account')
	end

	def create
		@investment_map = InvestmentMap.new(investment_map_params)
		if @investment_map.save
			redirect_to investment_maps_path, notice: 'Investment Map Added'
		else
			redirect_to investment_maps_path, alert: 'Failed to create Investment Map'
		end
	end

	def edit
		@title = 'Edit Investment Map'
		@investment_map = InvestmentMap.find(params[:id])
		@summary_types = SummaryType.all.order('stype')
		@accounts = Account.all.order('account')
	end

	def update
		@investment_map = InvestmentMap.find(params[:id])
		if @investment_map.update(investment_map_params)
			redirect_to investment_maps_path, notice: 'Investment Map Updated'
		else
			redirect_to investment_maps_path, alert: 'Failed to update Investment Map'
		end
	end

	def destroy
		@investment_map = InvestmentMap.find(params[:id])
		@investment_map.delete
			redirect_to investment_maps_path, notice: "Investment Map #{@investment_map.summary_type.stype} #{@investment_map.account.account} Deleted"
	end

private
	
	def investment_map_params
		params.require(:investment_map).permit(:account_id, :summary_type_id)
	end

	def require_investments
		unless has_role(current_user.id, 'investments')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
