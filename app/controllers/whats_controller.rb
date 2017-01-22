class WhatsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'What To Category Map'
		@whats = What.joins(:category).all.order('ctype, category, subcategory, what')
		@categorymap = Hash.new
		Category.all.each do |category|
			@categorymap[category.id] = Hash.new
			@categorymap[category.id]['ctype'] = category.ctype
			@categorymap[category.id]['category'] = category.category
			@categorymap[category.id]['subcategory'] = category.subcategory
			@categorymap[category.id]['tax'] = category.tax
		end
	end

	def new
		@title = 'New What Map'
		@what = What.new
		@categories = Category.all.order('ctype, category, subcategory, tax')
	end

	def create
		@what = What.new(what_params)
		if @what.save
			redirect_to whats_path, notice: 'What Map Added'
		else
			redirect_to whats_path, alert: 'Failed to create What Map'
		end
	end

	def edit
		@title = 'Edit What Map'
		@what = What.find(params[:id])
		@categories = Category.all.order('ctype, category, subcategory, tax')
	end

	def update
		@what = What.find(params[:id])
		if @what.update(what_params)
			redirect_to whats_path, notice: 'What map Updated'
		else
			redirect_to whats_path, alert: 'Failed to create What map'
		end
	end

	def show
		@what = What.find(params[:id])
		@title = "Where is '#{@what.what}'"
		@items = Item.where("what_id = ?", @what.id).order('date')
	end

	def remap
		@title = 'Remap specified What to another what'
		@what = What.find(params[:id])
		@whats = [['', 0]]
		What.where("id != ?", @what.id).order('what').each do |what|
			@whats.push([what.what, what.id])
		end
	end

	def remapupdate
		@id = params[:id]
		@what = What.find(@id)
		@newid = params[:newid]
		@newwhat = What.find(@newid)
		# update WhatMaps
		WhatMap.where("what_id = ?", @id).update_all(what_id: @newid)
		count = Item.where("what_id = ?", @id).count
		# update Items
		Item.where("what_id = ?", @id).update_all(what_id: @newid)
		What.find(@id).delete
		redirect_to whats_path, notice: "#{count} '#{@what.what}' remapped to '#{@newwhat.what}'"
	end

	def destroy
		@what = What.find(params[:id])
		if Item.where("what_id = ?", @what.id).count > 0
			redirect_to whats_path, alert: "What #{@what.what} is in use by an Item"
		elsif WhatMap.where("what_id = ?", @what.id).count > 0
			redirect_to whats_path, alert: "What #{@what.what} is in use by a WhatMap"
		else
			@what.delete
			redirect_to whats_path, notice: "What #{@what.what} Deleted"
		end
	end

private
	
	def what_params
		params.require(:what).permit(:what, :category_id)
	end

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
