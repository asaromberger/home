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
		accountids = InvestmentMap.where("summary_type_id = ?", @summary_type.id).pluck('DISTINCT account_id')
		@accounts = Account.where("id in (?)", accountids).order('account')
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
