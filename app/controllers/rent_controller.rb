class RentController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		if params[:fromyear]
			@fromyear = params[:fromyear]
		else
			@fromyear = Time.now.year - 10
		end
		if params[:toyear]
			@toyear = params[:toyear]
		else
			@toyear = Item.all.order('date DESC').first.date.year
		end
		@title = "Rents from #{@fromyear} to #{@toyear}"
		@pickyears = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@pickyears.push(year.to_i)
		end
		@pickyears = @pickyears.sort
		@years = []
		(@fromyear..@toyear).each do |year|
			@years.push(year.to_i)
		end
		# find rent categories
		catids = Category.where("tax = 'Rent'").pluck('id')
		# find units
		# accumulate rents
		# initialize unit/year/month grid
		temp = Hash.new
		unitids = []
		What.where("category_id in (?)", catids).order('what').each do |unit|
			unitids.push(unit.id)
			temp[unit.what] = Hash.new
			@years.each do |year|
				temp[unit.what][year] = Hash.new
				(1..12).each do |month|
					temp[unit.what][year][month] = 0
				end
			end
		end
		# accumulate rents by unit/year/month
		Item.where("what_id IN (?) AND EXTRACT(year FROM date) >= ? AND EXTRACT(year FROM date) <= ?", unitids, @fromyear, @toyear).order('what_id, date').each do |item|
			year = item.date.year
			month = item.date.month
			unit = item.what.what
			if item.pm == '-'
				temp[unit][year][month] = temp[unit][year][month] - item.amount
			else
				temp[unit][year][month] = temp[unit][year][month] + item.amount
			end
		end
		@rows = Hash.new
		index = -1
		temp.each do |unit, years|
			lastamount = 1000000
			years.each do |year, months|
				months.each do |month, amount|
					if amount != 0 && amount == lastamount
						@rows[index]['to'] = "#{year}-#{month}"
					elsif amount != 0
						index = index + 1;
						@rows[index] = Hash.new
						@rows[index]['unit'] = unit
						unit = ''
						@rows[index]['rent'] = amount
						@rows[index]['from'] = "#{year}-#{month}"
						@rows[index]['to'] = "#{year}-#{month}"
					end
					lastamount = amount
				end
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
