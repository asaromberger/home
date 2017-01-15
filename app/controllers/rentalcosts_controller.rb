class RentalcostsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		if params[:fromyear]
			@fromyear = params[:fromyear]
		else
			@fromyear = Item.all.order('date').first.date.year
		end
		if params[:toyear]
			@toyear = params[:toyear]
		else
			@toyear = Item.all.order('date DESC').first.date.year
		end
		@title = "Rental Costs from #{@fromyear} to #{@toyear}"
		@pickyears = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@pickyears.push(year.to_i)
		end
		@pickyears = @pickyears.sort
		@years = []
		(@fromyear..@toyear).each do |year|
			@years.push(year.to_i)
		end
		# @data[category][subcategory][year]
		@data = Hash.new
		Item.joins(:what => :category).where("ctype = 'business' AND EXTRACT(year FROM date) >= ? AND EXTRACT(year FROM date) <= ?", @fromyear, @toyear).each do |item|
			category = item.what.category.category
			if category != '33rd' && category != 'Fairview'
				next
			end
			subcategory = item.what.category.subcategory
			if subcategory == 'Rent' || subcategory == 'Security Deposit'
				next
			end
			amount = item.amount
			year = item.date.year
			if item.pm == '-'
				amount = -amount
			end
			# accumulate in cat/subcat/year
			if ! @data[category]
				@data[category] = Hash.new
			end
			if ! @data[category][subcategory]
				@data[category][subcategory] = Hash.new
			end
			if @data[category][subcategory][year]
				@data[category][subcategory][year] = @data[category][subcategory][year] + amount
			else
				@data[category][subcategory][year] = amount
			end
			# accumulate in cat/subcat/total
			if @data[category][subcategory]['total']
				@data[category][subcategory]['total'] = @data[category][subcategory]['total'] + amount
			else
				@data[category][subcategory]['total'] = amount
			end
			# accumulate in cat totals
			if ! @data[category]['~']
				@data[category]['~'] = Hash.new
			end
			if @data[category]['~'][year]
				@data[category]['~'][year] = @data[category]['~'][year] + amount
			else
				@data[category]['~'][year] = amount
			end
			# accumulate in cat/total
			if @data[category]['~']['total']
				@data[category]['~']['total'] = @data[category]['~']['total'] + amount
			else
				@data[category]['~']['total'] = amount
			end
		end
		# averages
		@data.each do |cat, catdata|
			catdata.each do |subcat, subcatdata|
				@data[cat][subcat]['average'] = @data[cat][subcat]['total'] / @years.count
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
