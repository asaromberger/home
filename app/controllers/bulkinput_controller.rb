class BulkinputController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'WhatMap'
		@whatmaps = WhatMap.all.order('whatmap')
	end

	def inputfromtracking
		@title = 'Bulk Input from Flat File'
	end

	def create
		# this is file input. results go to new
		@title = 'Classify Bulk Input'
		document = params[:document]
		File.open(Rails.root.join(document.original_filename), 'wb') do |file|
			@input = document.read
		end
		@errors = []
		lines = @input.split("\n")
		@table = Hash.new
		@whatlist = [['', 0]]
		What.all.order('what').each do |what|
			@whatlist.push([what.what, what.id])
		end
		@categorylist = [['', 0]]
		Category.all.order('ctype, category, subcategory, tax').each do |category|
			@categorylist.push(["#{category.ctype}/#{category.category}/#{category.subcategory}/#{category.tax}", category.id])
		end
		lineno = 0
		lines.each do |line|
			fields = line.split("\t")
			if fields[4]
				lineno = lineno + 1
				@table[lineno] = Hash.new
				date = fields[0].gsub(/^\s*/, '').gsub(/\s*$/, '')
				pm = fields[1].gsub(/^\s*/, '').gsub(/\s*$/, '')
				check = fields[2].gsub(/^\s*/, '').gsub(/\s*$/, '')
				what = fields[3].gsub(/^\s*/, '').gsub(/\s*$/, '')
				amount = fields[4].gsub(/^\s*/, '').gsub(/\s*$/, '')
				if date.match('^[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9]$')
					# MM/DD/YYYY
					month = date[0..1]
					day = date[3..4]
					year = date[6..9]
				elsif date.match('^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$')
					# YYYY-MM-DD
					month = date[5..6]
					day = date[8..9]
					year = date[0..3]
				else
					@errors.push("BAD DATE: #{date}")
					month = '01'
					day = '01'
					year = '1000'
				end
				date = "#{year}-#{month}-#{day}"
				@table[lineno]['date'] = date
				@table[lineno]['pm'] = pm
				@table[lineno]['check'] = check
				@table[lineno]['what'] = what
				@table[lineno]['amount'] = amount
				whatmap = WhatMap.where("whatmap = ?", what)
				if whatmap.count > 0
					whatmap = whatmap.first.what_id
				else
					whatmap = 0
				end
				@table[lineno]['whatmap'] = whatmap
				item = Item.where("date = ? AND pm = ? AND checkno = ? AND amount = ?", date, pm, check, amount)
				if item.count > 0
					item = item.first
					@table[lineno]['status'] = 'exists'
					if item.what_id.blank?
						@table[lineno]['category'] = 0
					else
						@table[lineno]['category'] = item.what.category_id
					end
				else
					@table[lineno]['status'] = 'new'
					@table[lineno]['category'] = 0
				end
			else
				@errors.push("BAD LINE: #{line}")
			end
		end
	end

	def new
		# classification page
		@title = 'Classify Bulk Input'
		@input = params[:input]
		@errors = []

		@table = Hash.new
		params[:table].each do |id, values|
			status = values['status']
			date = values['date']
			pm = values['pm']
			check = values['check']
			what = values['what']
			amount = values['amount']
			whatmap = values['whatmap'].to_i
			category = values['category'].to_i
			item = Item.where("date = ? AND pm = ? AND checkno = ? AND amount = ?", date, pm, check, amount)
			if status == 'exists' && whatmap > 0
				# item exists and has a what specified
				# update the item to point to the what
				item = item.first
				item.what_id = whatmap;
				item.save
				# update whatmap
				twhatmap = WhatMap.where("whatmap = ?", what)
				if twhatmap.count > 0
					twhatmap = twhatmap.first
				else
					twhatmap = WhatMap.new
					twhatmap.whatmap = what
				end
				twhatmap.what_id = whatmap
				twhatmap.save
			else
				@table[id] = Hash.new
				if whatmap > 0
					# whatmap specified
					# create or update item
					if item.count > 0
						item = item.first
					else
						item = Item.new
						item.date = date
						item.pm = pm
						item.checkno = check
						item.amount = amount
					end
					item.what_id = whatmap
					item.save
					@table[id]['status'] = 'exists'
				elsif category > 0
					# category specified
					# create or update What
					twhat = What.where("what = ?", what)
					if twhat.count > 0
						twhat = twhat.first
					else
						twhat = What.new
						twhat.what = what
					end
					twhat.category_id = category
					twhat.save
					twhat = What.where("what = ?", what).first
					# create or update whatmap
					twhatmap = WhatMap.where("whatmap = ?", what)
					if twhatmap.count > 0
						twhatmap = twhatmap.first
					else
						twhatmap = WhatMap.new
						twhatmap.whatmap = what
					end
					twhatmap.what_id = twhat.id
					twhatmap.save
					whatmap = WhatMap.where("whatmap = ?", what).first.what_id
					# create or update item
					if item.count > 0
						item = item.first
					else
						item = Item.new
						item.date = date
						item.pm = pm
						item.checkno = check
						item.amount = amount
					end
					item.what_id = whatmap
					item.save
					@table[id]['status'] = 'exists'
				else
					@table[id]['status'] = status
				end
				@table[id]['date'] = date
				@table[id]['pm'] = pm
				@table[id]['check'] = check
				@table[id]['what'] = what
				@table[id]['amount'] = amount
				@table[id]['whatmap'] = whatmap
				@table[id]['category'] = category
			end
		end
		@whatlist = [['', 0]]
		What.all.order('what').each do |what|
			@whatlist.push([what.what, what.id])
		end
		@categorylist = [['', 0]]
		Category.all.order('ctype, category, subcategory, tax').each do |category|
			@categorylist.push(["#{category.ctype}/#{category.category}/#{category.subcategory}/#{category.tax}", category.id])
		end
		if @table.count > 0
			render action: :create
		else
			redirect_to inputfromtracking_path, notice: "Entry Complete"
		end
	end

	def edit
	fail
	end

	def update
	fail
	end

private

	def require_expenses
		return has_role(current_user.id, 'expenses')
	end

end
