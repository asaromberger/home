class ItemsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		if params[:year].blank?
			@year = Time.now.year
		else
			@year = params[:year]
		end
		@title = "#{@year} Expenses"
		@years = []
		Item.all.pluck(Arel.sql("DISTINCT EXTRACT(year FROM date)")).each do |year|
			@years.push(year.to_i)
		end
		@years = @years.sort.reverse
		# build what_id to what and cat_id tables
		whats = Hash.new
		whatcatids = Hash.new
		What.all.each do |what|
			whats[what.id] = what.what
			whatcatids[what.id] = what.category_id
		end
		# build cat_id to ctype, category, subcategory, tax tables
		ctypes = Hash.new
		categories = Hash.new
		subcategories = Hash.new
		taxes = Hash.new
		Category.all.each do |category|
			ctypes[category.id] = category.ctype
			categories[category.id] = category.category
			subcategories[category.id] = category.subcategory
			taxes[category.id] = category.tax
		end
		@items = Hash.new
		Item.where("EXTRACT(year FROM date) = ?", @year).order('date').each do |item|
			@items[item.id] = Hash.new
			@items[item.id]['date'] = item.date
			@items[item.id]['pm'] = item.pm
			@items[item.id]['checkno'] = item.checkno
			@items[item.id]['what'] = whats[item.what_id]
			@items[item.id]['amount'] = item.amount
			@items[item.id]['ctype'] = ctypes[whatcatids[item.what_id]]
			@items[item.id]['category'] = categories[whatcatids[item.what_id]]
			@items[item.id]['subcategory'] = subcategories[whatcatids[item.what_id]]
			@items[item.id]['tax'] = taxes[whatcatids[item.what_id]]
		end
	end

	def new
		@title = 'New Item'
		@year = params[:year]
		@item = Item.new
		@item.date = Date.new(@year.to_i, 1, 1)
		@item.pm = '-'
		@whats = What.all.order('what')
	end

	def create
		@item = Item.new(item_params)
		@year = params[:year]
		if @item.save
			redirect_to items_path(year: @year), notice: 'Item Added'
		else
			redirect_to items_path(year: @year), alert: 'Failed to add Item'
		end
	end

	def edit
		@title = 'Edit Item'
		@year = params[:year]
		@item = Item.find(params[:id])
		@whats = What.all.order('what')
	end

	def update
		@year = params[:year]
		@item = Item.find(params[:id])
		if @item.update(item_params)
			redirect_to items_path(year: @year), notice: 'Item Updated'
		else
			redirect_to items_path(year: @year), alert: 'Failed to update Item'
		end
	end

	def destroy
		@year = params[:year]
		@item = Item.find(params[:id])
		@item.delete
		redirect_to items_path(year: @year), notice: "Item #{@item.date} #{@item.what.what} Deleted"
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
