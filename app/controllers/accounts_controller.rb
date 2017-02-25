class AccountsController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def new
		@status = params[:status]
		@title = 'New Account'
		@account = Account.new
		@atypes = [['cash'], ['brokerage'], ['annuity']]
	end

	def create
		@status = params[:status]
		if Account.where("account = ?", params[:account][:account]).count > 0
				redirect_to investments_path(status: @status), alert: 'Account already exists'
		else
			@account = Account.new(account_params)
			if @account.save
				redirect_to investments_path(status: @status), notice: 'Account Added'
			else
				redirect_to investments_path(status: @status), alert: 'Failed to create Account'
			end
		end
	end

	def edit
		@status = params[:status]
		@title = 'Edit Account'
		@account = Account.find(params[:id])
		@atypes = [['cash'], ['brokerage'], ['annuity']]
	end

	def update
		@status = params[:status]
		if Account.where("account = ?", params[:account][:account]).count > 0
				redirect_to investments_path(status: @status), alert: 'Account already exists'
		else
			@account = Account.find(params[:id])
			if @account.update(account_params)
				redirect_to investments_path(status: @status), notice: 'Account Updated'
			else
				redirect_to investments_path(status: @status), alert: 'Failed to update Account'
			end
		end
	end

	def destroy
		@status = params[:status]
		@account = Account.find(params[:id])
		Investment.where("account_id = ?", @account.id).delete_all
		InvestmentMap.where("account_id = ?", @account.id).delete_all
		RebalanceMap.where("account_id = ?", @account.id).delete_all
		@account.delete
		redirect_to investments_path(status: @status), notice: "Account #{@account.account} Deleted"
	end

	def close
		@status = params[:status]
		@account = Account.find(params[:id])
		investment = Investment.where("account_id = ?", @account.id).order('date DESC')
		if investment.count > 0
			investment = investment.first
			if investment.value != 0
				newinvestment = Investment.new
				newinvestment.account_id = @account.id
				newinvestment.date = investment.date + 1.day
				newinvestment.value = 0
				newinvestment.shares = 0
				newinvestment.pershare = 0
				newinvestment.guaranteed = 0
				newinvestment.save
			end
		end
		@account.closed = true
		@account.save
		redirect_to investments_path(status: @status), notice: "Account #{@account.account} Closed"
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
