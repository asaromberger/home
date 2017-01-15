class RunningbudgetController < ApplicationController

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
		@title = "Running Budget from #{@fromyear} to #{@toyear}"
		@pickyears = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@pickyears.push(year.to_i)
		end
		@pickyears = @pickyears.sort
		@years = []
		(@fromyear..@toyear).each do |year|
			@years.push(year.to_i)
		end
		# @data[ctype][category][subcategory][year]
		@data = Hash.new
		@ctotals = Hash.new
		Item.joins(:what => :category).where("EXTRACT(year FROM date) >= ? AND EXTRACT(year FROM date) <= ?", @fromyear, @toyear).each do |item|
			ctype = item.what.category.ctype
			category = item.what.category.category
			subcategory = item.what.category.subcategory
			amount = item.amount
			year = item.date.year
			if item.pm == '-'
				amount = -amount
			end
			# accumulate in cat/subcat/year
			if ! @data[ctype]
				@data[ctype] = Hash.new
			end
			if ! @ctotals[ctype]
				@ctotals[ctype] = Hash.new
			end
			if ! @data[ctype][category]
				@data[ctype][category] = Hash.new
			end
			if ! @data[ctype][category][subcategory]
				@data[ctype][category][subcategory] = Hash.new
			end
			if @data[ctype][category][subcategory][year]
				@data[ctype][category][subcategory][year] = @data[ctype][category][subcategory][year] + amount
			else
				@data[ctype][category][subcategory][year] = amount
			end
			# accumulate in cat/subcat/total
			if @data[ctype][category][subcategory]['total']
				@data[ctype][category][subcategory]['total'] = @data[ctype][category][subcategory]['total'] + amount
			else
				@data[ctype][category][subcategory]['total'] = amount
			end
			# accumulate in cat totals
			if ! @data[ctype][category]['~']
				@data[ctype][category]['~'] = Hash.new
			end
			if @data[ctype][category]['~'][year]
				@data[ctype][category]['~'][year] = @data[ctype][category]['~'][year] + amount
			else
				@data[ctype][category]['~'][year] = amount
			end
			# accumulate in cat/total
			if @data[ctype][category]['~']['total']
				@data[ctype][category]['~']['total'] = @data[ctype][category]['~']['total'] + amount
			else
				@data[ctype][category]['~']['total'] = amount
			end
			# accumulate in ctotals
			if @ctotals[ctype][year]
				@ctotals[ctype][year] = @ctotals[ctype][year] + amount
			else
				@ctotals[ctype][year] = amount
			end
			if @ctotals[ctype]['total']
				@ctotals[ctype]['total'] = @ctotals[ctype]['total'] + amount
			else
				@ctotals[ctype]['total'] = amount
			end
		end
		# averages
		@data.each do |ctype, ctypedata|
			ctypedata.each do |cat, catdata|
				catdata.each do |subcat, subcatdata|
					@data[ctype][cat][subcat]['average'] = @data[ctype][cat][subcat]['total'] / @years.count
				end
			end
		end
		@ctotals.each do |ctype, ctypedata|
			@ctotals[ctype]['average'] = @ctotals[ctype]['total'] / @years.count
		end
	end

private

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
