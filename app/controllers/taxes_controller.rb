class TaxesController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		if params[:year]
			@year = params[:year]
		else
			@year = Time.now.year
		end
		@title = "#{@year} Taxes"
		@years = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
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
		# tax category ids
		taxcategoryids = Category.where("(tax IS NOT NULL AND tax != '') OR ctype = 'rental'").pluck('DISTINCT id')
		# @data[ctype][category][subcategory][tax]
		@data = Hash.new
		Item.joins(:what).where("EXTRACT(year FROM date) = ? AND category_id in (?)", @year, taxcategoryids).each do |item|
			ctype = ctypes[whatcatids[item.what_id]]
			category = categories[whatcatids[item.what_id]]
			subcategory = subcategories[whatcatids[item.what_id]]
			tax = taxes[whatcatids[item.what_id]]
			amount = item.amount
			if item.pm == '-'
				amount = -amount
			end
			# accumulate in cat/subcat/tax
			if ! @data[ctype]
				@data[ctype] = Hash.new
			end
			if ! @data[ctype][category]
				@data[ctype][category] = Hash.new
			end
			if ! @data[ctype][category][subcategory]
				@data[ctype][category][subcategory] = Hash.new
			end
			if @data[ctype][category][subcategory][tax]
				@data[ctype][category][subcategory][tax] = @data[ctype][category][subcategory][tax] + amount
			else
				@data[ctype][category][subcategory][tax] = amount
			end
		end
	end

	def show
		@title = "Taxes for #{params[:year]} for #{params[:ctype]}/#{params[:cat]}/#{params[:subcat]}/#{params[:tax]}"
		categoryids = Category.where("ctype = ? AND category = ? AND subcategory = ? AND tax = ?", params[:ctype], params[:cat], params[:subcat], params[:tax]).pluck('DISTINCT id')
		@items = Item.joins(:what).where("EXTRACT(year FROM date) = ? AND category_id in (?)", params[:year], categoryids).order('date')
		@summary = Hash.new
		@items.each do |item|
			if @summary[item.what.what]
				@summary[item.what.what] = @summary[item.what.what] + item.amount
			else
				@summary[item.what.what] = item.amount
			end
		end
	end

private

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
