class ItemsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		if params[:year]
			@year = params[:year]
		else
			@year = Time.now.year
		end
		@title = "#{@year} Expenses"
		@items = Item.where("EXTRACT(year FROM date) = ?", @year).order('date')
		@years = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@years.push(year.to_i)
		end
		@years = @years.sort
	end

	def new
		@title = 'New Item'
		@item = Item.new
		@item.date = Date.new(params[:year].to_i, 1, 1)
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
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
