class CategoriesController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'Categories'
		@categories = Category.all.order('ctype, category, subcategory')
	end

	def new
		@title = 'New Category'
		@category = Category.new
	end

	def create
		@category = Category.new(category_params)
		if @category.save
			redirect_to categories_path, notice: 'Category Added'
		else
			redirect_to categories_path, alert: 'Failed to create Category'
		end
	end

	def edit
		@title = 'Edit Category'
		@category = Category.find(params[:id])
	end

	def update
		@category = Category.find(params[:id])
		if @category.update(category_params)
			redirect_to categories_path, notice: 'Category Updated'
		else
			redirect_to categories_path, alert: 'Failed to update Category'
		end
	end

	def destroy
		@category = Category.find(params[:id])
		if What.where("category_id = ?", @category.id).count > 0
			redirect_to categories_path, alert: "Category #{@category.ctype}/#{@category.category}/#{@category.subcategory}/#{@category.tax} is in use by a What"
		else
			@category.delete
			redirect_to categories_path, notice: "Category #{@category.ctype}/#{@category.category}/#{@category.subcategory}/#{@category.tax} Deleted"
		end
	end

	def bulkinput
		@title = 'Bulk Input of Categories'
		@input = ''
	end

	def bulkinputupdate
		@title = 'Bulk Input of Categories'
		@input = params[:input]
		@errors = []
		lines = @input.split("\n")
		lines.each do |line|
			# parse line
			fields = line.split("\t")
			if fields[2]
				ctype = fields[0].gsub(/^\s*/, '').gsub(/\s*$/, '')
				category = fields[1].gsub(/^\s*/, '').gsub(/\s*$/, '')
				subcategory = fields[2].gsub(/^\s*/, '').gsub(/\s*$/, '')
				if fields[3]
					tax = fields[3].gsub(/^\s*/, '').gsub(/\s*$/, '')
				else
					tax = ''
				end
				db = Category.where("ctype = ? AND category = ? AND subcategory = ? AND tax = ?", ctype, category, subcategory, tax)
				if db.count > 0
					@errors.push("DUP: #{line}")
				else
					newcategory = Category.new
					newcategory.ctype = ctype
					newcategory.category = category
					newcategory.subcategory = subcategory
					newcategory.tax = tax
					newcategory.save
					@errors.push("ADDED: #{line}")
				end
			else
				@errors.push("BAD LINE: #{line}")
			end
		end
		render action: :bulkinput
	end

private
	
	def category_params
		params.require(:category).permit(:ctype, :category, :subcategory, :tax)
	end

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
