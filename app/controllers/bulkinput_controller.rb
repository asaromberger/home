class BulkinputController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'WhatMap'
		@whatmaps = WhatMap.all.order('whatmap')
	end

	def edit
		@title = 'Bulk Input'
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
		@categorylist = [['', 0]]
		Category.all.order('ctype, category, subcategory, tax').each do |category|
			@categorylist.push(["#{category.ctype}/#{category.category}/#{category.subcategory}/#{category.tax}", category.id])
		end
		lineno = 0
		maxlineno = 30
		if lines[0].gsub(/:.*/, '') == 'OFXHEADER'
			# Quicken input
			accountmap = Hash.new
			accountmap['0014942631'] = 'savings'
			accountmap['0014942658'] = 'checking'
			accountmap['0026599074'] = 'fairview'
			accountmap['0050148729'] = 'business'
			accountmap['5420396180931795'] = 'mastercard'
			accountmap['5420396180938550'] = 'mastercard'
			accountmap['5420396180941950'] = 'mastercard'
			accountmap['5420396180939475'] = 'mastercard'
			accountmap['5420396180942115'] = 'mastercard'
			accountmap['4046440000274510'] = 'mastercard'
			# remerge lines
			tmp = ''
			lines.each do |line|
				tmp = "#{tmp}#{line}"
			end
			lines = tmp.split("<");
			type = '';
			date = '';
			amount = '';
			pm = '';
			fitid = '';
			check = '';
			what = '';
			account = 'UNKNOWN';
			lines.each do |line|
				key = line.gsub(/>.*/, '')
				line = line.gsub(/.*>/, '')
				if key == 'DTPOSTED'
					posted = line
					year = line[0..3]
					month = line[4..5]
					day = line[6..7]
					date = "#{year}-#{month}-#{day}"
				elsif key == 'TRNAMT'
					amount = line
					if amount[0..0] == '-'
						pm = '-'
						amount = amount.gsub(/-/, '')
					else
						pm = '+'
					end
				elsif key == 'CHECKNUM'
					check = line
				elsif key == 'NAME'
					what = line.gsub(/&amp;/, '&')
				elsif key == '/STMTTRN'
					what = "#{account}:#{what}"
					whatlist = WhatMap.where("whatmap = ?", what)
					if whatlist.count > 0
						what_ids = whatlist.pluck('DISTINCT what_id')
					else
						tmp = What.where("what = ?", what)
						if tmp.count > 0
							what_ids = tmp.pluck('DISTINCT id')
						else
							what_ids = [0]
						end
					end
					@whatlist = [['', 0]]
					whatlist.each do |wl|
						@whatlist.push([wl.whatmap, wl.id])
					end
					item = Item.where("date = ? AND pm = ? and checkno = ? and what_id IN (?) AND amount = ?", date, pm, check, what_ids, amount)
					if item.count > 0
						@errors.push("EXISTS: #{date} #{item.first.what.what} #{amount}")
					else
						lineno = lineno + 1
						if lineno > maxlineno
							@errors.push("Limited to #{maxlineno} lines at a time")
							break
						end
						@table[lineno] = Hash.new
						@table[lineno]['date'] = date
						@table[lineno]['pm'] = pm
						@table[lineno]['check'] = check
						@table[lineno]['what'] = what
						@table[lineno]['amount'] = amount
						@table[lineno]['whatmaplist'] = @whatlist
						@table[lineno]['category'] = 0
					end
					type = '';
					date = '';
					amount = '';
					pm = '';
					fitid = '';
					check = '';
					what = '';
				elsif key == 'ACCTID'
					if accountmap[line].blank?
						@errors.push("UNKNOWN ACCOUNT: #{line}")
						account = 'UNKNOWN'
					else
						account = accountmap[line]
					end
				end
			end
		else
			# Flat File Input
			lines.each do |line|
				fields = line.split("\t")
				if fields[4]
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
					whatlist = WhatMap.where("whatmap = ?", what)
					if whatlist.count > 0
						what_ids = whatlist.pluck('DISTINCT what_id')
					else
						tmp = What.where("what = ?", what)
						if tmp.count > 0
							what_ids = tmp.pluck('DISTINCT id')
						else
							what_id = [0]
						end
					end
					@whatlist = [['', 0]]
					whatlist.each do |wl|
						@whatlist.push([wl.whatmap, wl.id])
					end
					item = Item.where("date = ? AND pm = ? and checkno = ? and what_id IN (?) AND amount = ?", date, pm, check, what_ids, amount)
					if item.count > 0
						@errors.push("EXISTS: #{date} #{item.first.what.what} #{amount}")
					else
						lineno = lineno + 1
						if lineno > maxlineno
							@errors.push("Limited to #{maxlineno} lines at a time")
							break
						end
						@table[lineno] = Hash.new
						@table[lineno]['date'] = date
						@table[lineno]['pm'] = pm
						@table[lineno]['check'] = check
						@table[lineno]['what'] = what
						@table[lineno]['amount'] = amount
						@table[lineno]['whatmaplist'] = @whatlist
						@table[lineno]['category'] = 0
					end
				else
					@errors.push("BAD LINE: #{line}")
				end
			end
		end
	end

	def new
		# classification page
		@title = 'Classify Bulk Input'
		@input = params[:input]
		@errors = []
		@table = Hash.new
		lineno = 0
		params[:table].each do |id, values|
			date = values['date']
			pm = values['pm']
			check = values['check']
			what = values['what']
			amount = values['amount']
			mapto = values['mapto']
			whatmap = values['whatmap'].to_i
			category = values['category'].to_i
			if mapto.blank?
				newwhat = what
			else
				newwhat = mapto
			end
			if category > 0
				twhat = What.where("what = ?", newwhat)
				if twhat.count == 0
					twhat = What.new
					twhat.what = newwhat
					twhat.category_id = category
					twhat.save
				end
				whatmap = What.where("what = ?", newwhat).first.id
			end
			if ! mapto.blank?
				twhatmap = WhatMap.joins(:what).where("whatmap = ? AND whats.what = ?", what, mapto)
				if twhatmap.count == 0
					# need to create a new map
					twhat = What.where("what = ?", mapto)
					if twhat.count > 0
						whatmap = twhat.first.id
						twhatmap = WhatMap.new
						twhatmap.whatmap = what
						twhatmap.what_id = whatmap
						twhatmap.save
					end
				end
				newwhat = mapto
			else
				newwhat = what
			end
			item = Item.joins(:what).where("date = ? AND pm = ? AND checkno = ? AND what = ? AND amount = ?", date, pm, check, newwhat, amount)
			if whatmap > 0
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
			end
			# recycle the item if it is not categorized
			whatlist = [newwhat]
			WhatMap.where("whatmap = ?", what).each do |map|
				whatlist.push(map.what.what)
			end
			item = Item.joins(:what).where("date = ? AND pm = ? AND checkno = ? AND what IN (?) AND amount = ?", date, pm, check, whatlist, amount)
			if item.count == 0
				lineno = lineno + 1
				@table[lineno] = Hash.new
				@table[lineno]['date'] = date
				@table[lineno]['pm'] = pm
				@table[lineno]['check'] = check
				@table[lineno]['what'] = what
				@table[lineno]['amount'] = amount
				@table[lineno]['whatmaplist'] = [['', 0]]
				WhatMap.where("whatmap = ?", what).each do |wl|
					@table[lineno]['whatmaplist'].push([wl.what.what, wl.what_id])
				end
				twhat = What.where("what = ?", what)
				if twhat.count > 0
					@errors.push("#{date} #{what} #{twhat.first.category_id}")
					@table[lineno]['category'] = twhat.first.category_id
				else
					@table[lineno]['category'] = 0
				end
			else
				@errors.push("Item Complete: #{date} #{what} #{amount}")
			end
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

	def update
	fail
	end

private

	def require_expenses
		return has_role(current_user.id, 'expenses')
	end

end
