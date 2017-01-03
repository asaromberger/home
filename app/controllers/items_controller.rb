class ItemsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'Year Expenses'
		@year = '2016'
		@items = Item.where("EXTRACT(year FROM date) = ?", @year).order('date')
	end

	def new
		@title = 'New Item'
		@item = Item.new
		@whats = What.all.order('what')
	end

	def create
		@item = Item.new(item_params)
		if @item.save
			redirect_to items_path, notice: 'Item Added'
		else
			redirect_to items_path, alert: 'Failed to add Item'
		end
	end

	def edit
		@title = 'Edit Item'
		@item = Item.find(params[:id])
		@whats = What.all.order('what')
	end

	def update
		@item = Item.find(params[:id])
		if @item.update(item_params)
			redirect_to items_path, notice: 'Item Updated'
		else
			redirect_to items_path, alert: 'Failed to update Item'
		end
	end

	def destroy
		@item = Item.find(params[:id])
		@item.delete
		redirect_to items_path, notice: 'Item #{@item.date} #{@item.what.what} Deleted'
	end

private

	def item_params
		params.require(:item).permit(:date, :pm, :checkno, :what_id, :amount)
	end

	def require_expenses
		return has_role(current_user.id, 'expenses')
	end

end
