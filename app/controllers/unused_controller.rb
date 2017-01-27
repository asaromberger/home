class UnusedController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'Unused'
		category_ids = What.all.pluck('DISTINCT category_id')
		@categories = Category.where("id NOT IN (?)", category_ids).order('ctype, category, subcategory')
		item_what_ids = Item.all.pluck('DISTINCT what_id')
		what_maps_what_ids = WhatMap.all.pluck('DISTINCT what_id')
		@whats = What.where("id NOT IN (?) AND id NOT IN (?)", item_what_ids, what_maps_what_ids).order('what')
	end

	def destroy
		if params[:table] == 'category'
			category = Category.find(params[:id])
			if What.where("category_id = ?", category.id).count > 0
				redirect_to unused_index_path, alert: "Category in use: #{category.ctype}/#{category.category}/#{category.subcategory}/#{category.tax}"
			else
				category.delete
				redirect_to unused_index_path, notice: "Category deleted: #{category.ctype}/#{category.category}/#{category.subcategory}/#{category.tax}"
			end
		elsif params[:table] == 'what'
			what = What.find(params[:id])
			if Item.where("what_id = ?", what.id).count > 0
				redirect_to unused_index_path, alert: "What in use by Item: #{what.what}"
			elsif WhatMap.where("what_id = ?", what.id).count > 0
				redirect_to unused_index_path, alert: "What in use by WhatMap: #{what.what}"
			else
				what.delete
				redirect_to unused_index_path, notice: "What deleted: #{what.what}"
			end
		else
			redirect_to unused_index_path, alert: "Unrecognized table: #{params[:table]}"
		end
	end

private

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
