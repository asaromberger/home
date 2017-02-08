class InvestmentsController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def index
		@title = 'Accounts'
		@accounts = Hash.new
		@errors = params[:errors]
		@exists = params[:exists]
		Account.all.order('account').each do |account|
			@accounts[account.id] = Hash.new
			@accounts[account.id]['account'] = account.account
			@accounts[account.id]['type'] = account.atype
			investment = Investment.where("account_id = ?", account.id).order('date DESC')
			if investment.count > 0
				@accounts[account.id]['date'] = investment.first.date
				@accounts[account.id]['value'] = investment.first.value
			else
				@accounts[account.id]['date'] = ''
				@accounts[account.id]['value'] = 0
			end
		end
	end

	def show
		@account = Account.find(params[:id])
		@title = "#{@account.account}"
		if @account.atype == 'cash'
			@headers = []
		elsif @account.atype == 'brokerage'
			@headers = ['Shares', 'Per Share']
		elsif @account.atype == 'annuity'
			@headers = ['Guaranteed', 'Yearly']
		end
		@errors = params[:errors]
		@exists = params[:exists]
		@investments = Hash.new
		Investment.where("account_id = ?", @account.id).order('date DESC').each do |investment|
			@investments[investment.id] = Hash.new
			@investments[investment.id]['date'] = investment.date
			@investments[investment.id]['value'] = investment.value
			if @account.atype == 'cash'
			elsif @account.atype == 'brokerage'
				@investments[investment.id]['Shares'] = investment.shares
				@investments[investment.id]['Per Share'] = investment.pershare
			elsif @account.atype == 'annuity'
				@investments[investment.id]['Guaranteed'] = investment.guaranteed
				@investments[investment.id]['Yearly'] = investment.guaranteed * 0.05
			end
		end
	end

	def new
		@account = Account.find(params[:id])
		@title = "New Entry for #{@account.account}"
		@investment = Investment.new
		now = Time.now
		@investment.date = Date.new(now.year, now.month, now.day)
		if @account.atype == 'cash'
			@headers = ['value']
		elsif @account.atype == 'brokerage'
			@headers = ['shares', 'pershare']
		elsif @account.atype == 'annuity'
			@headers = ['value', 'guaranteed']
		end
	end

	def create
		@account = Account.find(params[:account])
		@investment = Investment.new(investment_params)
		@investment.account_id = @account.id
		if @account.atype == 'brokerage'
			@investment.value = @investment.shares * @investment.pershare
		end
		if @investment.save
			redirect_to investments_path, notice: 'Item Added'
		else
			redirect_to investments_path, alert: 'Failed to create Item'
		end
	end

	def edit
		@account = Account.find(params[:account])
		@title = "Edit Entry for #{@account.account}"
		@investment = Investment.find(params[:id])
		if @account.atype == 'cash'
			@headers = ['value']
		elsif @account.atype == 'brokerage'
			@headers = ['shares', 'pershare']
		elsif @account.atype == 'annuity'
			@headers = ['value', 'guaranteed']
		end
	end

	def update
		@account = Account.find(params[:account])
		@investment = Investment.find(params[:id])
		if @account.atype == 'brokerage'
			params[:investment][:value] = params[:investment][:shares].to_f * params[:investment][:pershare].to_f
		end
		if @investment.update(investment_params)
			redirect_to investments_path, notice: 'Item Updated'
		else
			redirect_to investments_path, alert: 'Failed to update Item'
		end
	end

	def destroy
		@investment = Investment.find(params[:id])
		@investment.delete
		redirect_to investments_path, notice: "Item Deleted"
	end

private
	
	def investment_params
		params.require(:investment).permit(:date, :value, :shares, :pershare, :guaranteed)
	end

	def require_investments
		unless has_role(current_user.id, 'investments')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
