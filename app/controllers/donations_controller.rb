class DonationsController < ApplicationController

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
		@title = "Donations from #{@fromyear} to #{@toyear}"
		@pickyears = []
		Item.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@pickyears.push(year.to_i)
		end
		@pickyears = @pickyears.sort
		@years = []
		(@fromyear..@toyear).each do |year|
			@years.push(year.to_i)
		end
		# find donations categories
		donationcatids = Category.where("tax = 'Donations'").pluck('DISTINCT id')
		# find donations
		@donations = Hash.new
		whatids = []
		What.where("category_id IN (?)", donationcatids).order('what').each do |what|
			whatids.push(what.id)
			@donations[what.id] = Hash.new
			@donations[what.id]['name'] = what.what
			@years.each do |year|
				@donations[what.id][year] = 0
			end
			@donations[what.id]['total'] = 0
		end
		# accumulate donations
		Item.where("what_id IN (?) AND EXTRACT(year FROM date) >= ? AND EXTRACT(year FROM date) <= ?", whatids, @fromyear, @toyear).each do |item|
			@donations[item.what_id][item.date.year] = @donations[item.what_id][item.date.year] + item.amount
			@donations[item.what_id]['total'] = @donations[item.what_id]['total'] + item.amount
		end
		@donations.each do |id, values|
			if values['total'] == 0
				@donations.delete(id)
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
