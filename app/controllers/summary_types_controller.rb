class SummaryTypesController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def index
		@title = 'Manage Summary Types'
		@summary_types = SummaryType.all.order('priority')
	end

	def show
		@summary_type = SummaryType.find(params[:id])
		@title = "Accounts in #{@summary_type.stype}"
		@accounts = Hash.new
		Account.all.order('account').each do |account|
			@accounts[account.id] = Hash.new
			@accounts[account.id]['name'] = account.account
			@accounts[account.id]['included'] = false
		end
		InvestmentMap.where("summary_type_id = ?", @summary_type.id).pluck('DISTINCT account_id').each do |account_id|
			@accounts[account_id]['included'] = true
		end
	end

	def showupdate
		@summary_type = SummaryType.find(params[:summary_type])
		Account.all.each do |account|
			investment_map = InvestmentMap.where("summary_type_id = ? AND account_id = ?", @summary_type.id, account.id)
			if params[account.id.to_s] == 'on'
				if investment_map.count == 0
					investment_map = InvestmentMap.new
					investment_map.summary_type_id = @summary_type.id
					investment_map.account_id = account.id
					investment_map.save
				end
			else
				if investment_map.count > 0
					investment_map.delete_all
				end
			end
		end
		redirect_to summary_types_path, notice: "#{@summary_type.stype} updated"
	end

	def new
		@title = 'New Summary Type'
		@summary_type = SummaryType.new
	end

	def create
		if SummaryType.where("stype = ?", params[:summary_type][:stype]).count > 0
			redirect_to summary_types_path, alert: 'Summary Type already exists'
		else
			@summary_type = SummaryType.new(summary_type_params)
			if @summary_type.save
				redirect_to summary_types_path, notice: 'Summary Type Added'
			else
				redirect_to summary_types_path, alert: 'Failed to create Summary Type'
			end
		end
	end

	def edit
		@title = 'Edit Summary Type'
		@summary_type = SummaryType.find(params[:id])
	end

	def update
		if SummaryType.where("stype = ?", params[:summary_type][:stype]).count > 0
			redirect_to summary_types_path, alert: 'Summary Type already exists'
		else
			@summary_type = SummaryType.find(params[:id])
			if @summary_type.update(summary_type_params)
				redirect_to summary_types_path, notice: 'Summary Type Updated'
			else
				redirect_to summary_types_path, alert: 'Failed to update Summary Type'
			end
		end
	end

	def destroy
		@summary_type = SummaryType.find(params[:id])
		InvestmentMap.where("summary_type_id = ?", @summary_type.id).delete_all
		@summary_type.delete
			redirect_to summary_types_path, notice: "Summary Type #{@summary_type.stype} Deleted"
	end

private
	
	def summary_type_params
		params.require(:summary_type).permit(:stype, :priority)
	end

	def require_investments
		unless has_role(current_user.id, 'investments')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
