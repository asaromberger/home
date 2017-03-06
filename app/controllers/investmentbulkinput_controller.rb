class InvestmentbulkinputController < ApplicationController

	before_action :require_signed_in
	before_action :require_investments

	def new
		@title = 'Bulk Input'
		@accounts = []
		Account.all.order('account').each do |account|
			@accounts.push([account.account, account.id])
		end
	end

	def create
		@title = 'Investment Bulk Input'
		@account = Account.find(params[:account])
		@document = params[:document]
		@documentname = @document.original_filename
		path = Rails.root.join(@document.original_filename)
		File.open(path, 'wb') do |file|
			@input = @document.read
		end
		File.delete(path) if File.exists?(path)
		@errors = []
		@exists = 0
		lines = @input.split("\n")
		# Flat File Input
		lines.each do |line|
			fields = line.split("\t")
			if fields[0]
				date = fields[0].gsub(/^\s*/, '').gsub(/\s*$/, '')
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
					next
				end
				date = "#{year}-#{month}-#{day}"
				if Investment.where("account_id = ? AND date = ?", @account.id, date).count > 0
					@exists = @exists + 1
					next
				end
			end
			if @account.atype == 'cash'
				if fields[1]
					value = fields[1].gsub(/^\s*/, '').gsub(/\s*$/, '').to_f
				else
					@errors.push("BAD LINE: #{line}")
					next
				end
				investment = Investment.new
				investment.account_id = @account.id
				investment.date = date
				investment.value = value
				investment.save
			elsif @account.atype == 'brokerage'
				if fields[2]
					shares = fields[1].gsub(/^\s*/, '').gsub(/\s*$/, '').to_f
					pershare = fields[2].gsub(/^\s*/, '').gsub(/\s*$/, '').to_f
				else
					@errors.push("BAD LINE: #{line}")
					next
				end
				investment = Investment.new
				investment.account_id = @account.id
				investment.date = date
				investment.shares = shares
				investment.pershare = pershare
				investment.value = shares * pershare
				investment.save
			elsif @account.atype == 'annuity'
				if fields[2]
					value = fields[1].gsub(/^\s*/, '').gsub(/\s*$/, '').to_f
					guaranteed = fields[2].gsub(/^\s*/, '').gsub(/\s*$/, '').to_f
				else
					@errors.push("BAD LINE: #{line}")
					next
				end
				investment = Investment.new
				investment.account_id = @account.id
				investment.date = date
				investment.value = value
				investment.guaranteed = guaranteed
				investment.save
			end
		end
		redirect_to investment_path(id: @account.id, documentname: @documentname, errors: @errors, exists: @exists)
	end

private

	def require_investments
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
