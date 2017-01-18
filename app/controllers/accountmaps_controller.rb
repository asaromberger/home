class AccountmapsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'Account Number to Category Type'
		@accountmaps = Accountmap.all.order('account')
	end

	def new
		@title = 'New Account Map'
		@accountmap = Accountmap.new
	end

	def create
		@accountmap = Accountmap.new(accountmap_params)
		if @accountmap.save
			redirect_to accountmaps_path, notice: 'Account Map Added'
		else
			redirect_to accountmaps_path, alert: 'Failed to create Account Map'
		end
	end

	def edit
		@title = 'Edit Account Map'
		@accountmap = Accountmap.find(params[:id])
	end

	def update
		@accountmap = Accountmap.find(params[:id])
		if @accountmap.update(accountmap_params)
			redirect_to accountmaps_path, notice: 'Account map Updated'
		else
			redirect_to accountmaps_path, alert: 'Failed to create Account map'
		end
	end

	def destroy
		@accountmap = Accountmap.find(params[:id])
		@accountmap.delete
		redirect_to accountmaps_path, notice: "Accountmap #{@accountmap.account} Deleted"
	end

private
	
	def accountmap_params
		params.require(:accountmap).permit(:account, :ctype)
	end

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
