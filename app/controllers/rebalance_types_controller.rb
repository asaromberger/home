class RebalanceTypesController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def index
		@title = 'Manage Rebalance Types'
		@rebalance_types = RebalanceType.all.order('rtype')
	end

	def show
		@rebalance_type = RebalanceType.find(params[:id])
		@title = "Accounts in #{@rebalance_type.rtype}"
		@accounts = Hash.new
		Account.where("closed IS NULL OR closed = false").order('account').each do |account|
			@accounts[account.id] = Hash.new
			@accounts[account.id]['name'] = account.account
			@accounts[account.id]['included'] = false
		end
		RebalanceMap.where("rebalance_type_id = ?", @rebalance_type.id).each do |map|
			if @accounts.key?(map.account_id)
				@accounts[map.account_id]['included'] = true
				@accounts[map.account_id]['target'] = map.target
			end
		end
	end

	def showupdate
		@rebalance_type = RebalanceType.find(params[:rebalance_type])
		total = 0
		Account.all.each do |account|
			rebalance_map = RebalanceMap.where("rebalance_type_id = ? AND account_id = ?", @rebalance_type.id, account.id)
			if rebalance_map.count > 0
				rebalance_map.delete_all
			end
			if params[account.id.to_s] == 'on'
				target = params["target#{account.id}"].to_f
				total = total + target
				rebalance_map = RebalanceMap.new
				rebalance_map.rebalance_type_id = @rebalance_type.id
				rebalance_map.account_id = account.id
				rebalance_map.target = target
				rebalance_map.save
			end
		end
		if total == 1
			redirect_to rebalance_types_path, notice: "#{@rebalance_type.rtype} updated"
		else
			redirect_to rebalance_types_path, alert: "#{@rebalance_type.rtype} totals to #{total}"
		end
	end

	def new
		@title = 'New Rebalance Type'
		@rebalance_type = RebalanceType.new
	end

	def create
		if RebalanceType.where("rtype = ?", params[:rebalance_type][:rtype]).count > 0
			redirect_to rebalance_types_path, alert: 'Rebalance Type already exists'
		else
			@rebalance_type = RebalanceType.new(rebalance_type_params)
			if @rebalance_type.save
				redirect_to rebalance_types_path, notice: 'Rebalance Type Added'
			else
				redirect_to rebalance_types_path, alert: 'Failed to create Rebalance Type'
			end
		end
	end

	def edit
		@title = 'Edit Rebalance Type'
		@rebalance_type = RebalanceType.find(params[:id])
	end

	def update
		if RebalanceType.where("rtype = ?", params[:rebalance_type][:rtype]).count > 0
			redirect_to rebalance_types_path, alert: 'Rebalance Type already exists'
		else
			@rebalance_type = RebalanceType.find(params[:id])
			if @rebalance_type.update(rebalance_type_params)
				redirect_to rebalance_types_path, notice: 'Rebalance Type Updated'
			else
				redirect_to rebalance_types_path, alert: 'Failed to update Rebalance Type'
			end
		end
	end

	def destroy
		@rebalance_type = RebalanceType.find(params[:id])
		RebalanceMap.where("rebalance_type_id = ?", params[:id]).delete_all
		@rebalance_type.delete
		redirect_to rebalance_types_path, notice: "Rebalance Type #{@rebalance_type.rtype} Deleted"
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
