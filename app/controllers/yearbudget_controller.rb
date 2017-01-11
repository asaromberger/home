class YearbudgetController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'Year Budget'
		if params[:year]
			@year = params[:year]
		else
			@year = Time.now.year
		end
		@years = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@years.push(year.to_i)
		end
		@years = @years.sort
		# @data[ctype][category][subcategory][month]
		@data = Hash.new
		Item.joins(:what => :category).where("EXTRACT(year FROM date) = ?", @year).each do |item|
			ctype = item.what.category.ctype
			category = item.what.category.category
			subcategory = item.what.category.subcategory
			amount = item.amount
			month = item.date.month
			if item.pm = '-'
				amount = -amount
			end
			if ! @data[ctype]
				@data[ctype] = Hash.new
			end
			if ! @data[ctype][category]
				@data[ctype][category] = Hash.new
			end
			if ! @data[ctype][category][subcategory]
				@data[ctype][category][subcategory] = Hash.new
			end
			if @data[ctype][category][subcategory][month]
				@data[ctype][category][subcategory][month] = @data[ctype][category][subcategory][month] + amount
			else
				@data[ctype][category][subcategory][month] = amount
			end
			if @data[ctype][category][subcategory]['total']
				@data[ctype][category][subcategory]['total'] = @data[ctype][category][subcategory]['total'] + amount
			else
				@data[ctype][category][subcategory]['total'] = amount
			end
		end
		@data.each do |ctype, ctypedata|
			ctypedata.each do |cat, catdata|
			#	cattot = Hash.new
			#	12.times do |month|
			#		cattot[month] = 0
			#	end
				catdata.each do |subcat, subcatdata|
					@data[ctype][cat][subcat]['average'] = @data[ctype][cat][subcat]['total'] / 12
			#		12.times do |month|
			#			cattot[month + 1] = cattot[month + 1] + @data[ctype][cat][subcat][month + 1]
			#		end
				end
			end
		end
	end

	def new
	fail
	end

	def create
	fail
	end

	def edit
	fail
	end

	def update
	fail
	end

private

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
