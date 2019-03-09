class GeneaologiesController < ApplicationController

	before_action :require_signed_in
	before_action :require_geneaology

	def index
		fail
	end

	def new
		fail
	end

	def create
		fail
	end

	def edit
		fail
	end

	def update
		fail
	end

	def destroy
		fail
	end

	def bulkinput
		@title = 'Bulk input of Data'
		@input = ''
	end

	def bulkinputupdate
		@title = 'Bulk input of Data: Errors'
		@document = params[:document]
		@documentname = @document.original_filename
		path = Rails.root.join(@document.original_filename)
		File.open(path, 'wb') do |file|
			@input = @document.read
		end
		File.delete(path) if File.exists?(path)
		@errors = []
		lines = @input.split("\n")
		lines.each do |line|
			@errors.push(line);
		end
		render 'bulkinput'
	end

private

	def require_geneaology
		unless has_role(current_user.id, 'geneaology')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	def geneaology_params
		#params.require(:geneaology).permit(:summary, :status, :description, :priority)
	end

end
