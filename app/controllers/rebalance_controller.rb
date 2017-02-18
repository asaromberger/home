class RebalanceController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def index
		@title = 'Rebalance Account Groups'
		@rebalances = RebalanceType.all.order('rtype')
	end

	def edit
		@rebalance = RebalanceType.find(params[:id])
		@title = "Rebalance #{@rebalance.rtype}"
		@accounts = Hash.new
		RebalanceMap.joins(:account).where("rebalance_type_id = ?", @rebalance.id).order('account').each do |map|
			@accounts[map.account_id] = Hash.new
			@accounts[map.account_id]['name'] = map.account.account
			investment = Investment.where("account_id = ?", map.account_id).order('date DESC')
			if investment.count > 0
				@accounts[map.account_id]['value'] = investment.first.value
			else
				@accounts[map.account_id]['value'] = 0
			end
			@accounts[map.account_id]['target'] = map.target
		end
	end

	def update
		@rebalance = RebalanceType.find(params[:id])
		@title = "Rebalance #{@rebalance.rtype}"
		@accounts = Hash.new
		@total = 0
		# get account information
		RebalanceMap.joins(:account).where("rebalance_type_id = ?", @rebalance.id).order('account').each do |map|
			@accounts[map.account_id] = Hash.new
			@accounts[map.account_id]['name'] = map.account.account
			investment = Investment.where("account_id = ?", map.account_id).order('date DESC')
			if investment.count > 0
				@accounts[map.account_id]['value'] = investment.first.value
			else
				@accounts[map.account_id]['value'] = 0
			end
			@accounts[map.account_id]['target'] = map.target
			@total = @total + @accounts[map.account_id]['value']
		end
		withdraw = params[:withdraw].to_f
		@total = @total - withdraw
		# calculate amount to move to/from each account
		@accounts.each do |id, account|
			t = @total * account['target']
			@accounts[id]['target'] = t
			@accounts[id]['move'] = t - account['value'];
		end
		# withdraws
		@withdraws = []
		if withdraw > 0
			@accounts.each do |id, account|
				if withdraw > 0 && account['move'] < 0
					if withdraw > -account['move']
						t = -account['move']
					else
						t = withdraw
					end
					@withdraws.push([t, account['name']])
					@accounts[id]['move'] = @accounts[id]['move'] + t
					withdraw = withdraw - t
				end
			end
		end
		# transfers
		@transfers = []
		@accounts.each do |fid, faccount|
			@accounts.each do |tid, taccount|
				if @accounts[fid]['move'] < 0
					if taccount['move'] > 0
						if -faccount['move'] > taccount['move']
							t = taccount['move']
						else
							t = -faccount['move']
						end
						@transfers.push([t, faccount['name'], taccount['name']]);
						@accounts[fid]['move'] = @accounts[fid]['move'] + t
						@accounts[tid]['move'] = @accounts[tid]['move'] - t
					end
				end
			end
		end
	end

private
	
	def rebalance_type_params
		params.require(:rebalance_type).permit(:rtype)
	end

	def require_investments
		unless has_role(current_user.id, 'investments')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	end
