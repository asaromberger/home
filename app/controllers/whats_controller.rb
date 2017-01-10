class WhatsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'What To Category Map'
		@whats = What.joins(:category).all.order('ctype, category, subcategory')
	end

	def new
		@title = 'New What Map'
		@what = What.new
		@categories = Category.all.order('ctype, category, subcategory, tax')
	end

	def create
		@what = What.new(what_params)
		if @what.save
			redirect_to whats_path, notice: 'What Map Added'
		else
			redirect_to whats_path, alert: 'Failed to create What Map'
		end
	end

	def edit
		@title = 'Edit What Map'
		@what = What.find(params[:id])
		@categories = Category.all.order('ctype, category, subcategory, tax')
	end

	def update
		@what = What.find(params[:id])
		if @what.update(what_params)
			redirect_to whats_path, notice: 'What map Updated'
		else
			redirect_to whats_path, alert: 'Failed to create What map'
		end
	end

	def destroy
		@what = What.find(params[:id])
		@what.delete
		redirect_to whats_path, notice: "What Map #{@what.what} Deleted"
	end

private
	
	def what_params
		params.require(:what).permit(:what, :category_id)
	end

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
