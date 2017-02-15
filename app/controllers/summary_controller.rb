class SummaryController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def index
		if params[:fromyear]
			@fromyear = params[:fromyear]
		else
			@fromyear = Investment.all.order('date').first.date.year
		end
		if params[:toyear]
			@toyear = params[:toyear]
		else
			@toyear = Investment.all.order('date DESC').first.date.year
		end
		@title = "Investments Summary"
		@pickyears = []
		Investment.all.pluck("DISTINCT EXTRACT(year FROM date)").each do |year|
			@pickyears.push(year.to_i)
		end
		@pickyears = @pickyears.sort
		@years = []
		(@fromyear..@toyear).each do |year|
			@years.push(year.to_i)
		end
		@summaries = Hash.new
		SummaryType.all.order('priority').each do |summary|
			@summaries[summary.id] = Hash.new
			@summaries[summary.id]['name'] = summary.stype
			@summaries[summary.id]['priority'] = summary.priority
			@years.each do |year|
				@summaries[summary.id][year] = 0
			end
			InvestmentMap.where("summary_type_id = ?", summary.id).each do |map|
				t = Hash.new
				Investment.where("account_id = ? AND EXTRACT(year FROM date) >= ? AND EXTRACT(year FROM date) <= ?", map.account_id, @fromyear, @toyear).order('date').each do |investment|
					t[investment.date.year] = investment.value
				end
				@years.each do |year|
					if t[year]
						@summaries[summary.id][year] = @summaries[summary.id][year] + t[year]
					end
				end
			end
		end
	end

private

	def require_investments
		unless has_role(current_user.id, 'investments')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
