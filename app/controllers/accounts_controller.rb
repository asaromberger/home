class AccountsController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def new
		@title = 'New Account'
		@account = Account.new
		@atypes = [['cash'], ['brokerage'], ['annuity']]
	end

	def create
		if Account.where("account = ?", params[:account][:account]).count > 0
				redirect_to investments_path, alert: 'Account already exists'
		else
			@account = Account.new(account_params)
			if @account.save
				redirect_to investments_path, notice: 'Account Added'
			else
				redirect_to investments_path, alert: 'Failed to create Account'
			end
		end
	end

	def edit
		@title = 'Edit Account'
		@account = Account.find(params[:id])
		@atypes = [['cash'], ['brokerage'], ['annuity']]
	end

	def update
		if Account.where("account = ?", params[:account][:account]).count > 0
				redirect_to investments_path, alert: 'Account already exists'
		else
			@account = Account.find(params[:id])
			if @account.update(account_params)
				redirect_to investments_path, notice: 'Account Updated'
			else
				redirect_to investments_path, alert: 'Failed to update Account'
			end
		end
	end

	def destroy
		@account = Account.find(params[:id])
		Investment.where("account_id = ?", @account.id).delete_all
		InvestmentMap.where("account_id = ?", @account.id).delete_all
		Rebalance_maps.where("account_id = ?", @account.id).delete_all
		@account.delete
		redirect_to investments_path, notice: "Account #{@account.account} Deleted"
	end

private
	
	def account_params
		params.require(:account).permit(:account, :atype)
	end

	def require_investments
		unless has_role(current_user.id, 'investments')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
