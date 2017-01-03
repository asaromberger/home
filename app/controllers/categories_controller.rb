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
		@category.delete
		redirect_to categories_path, notice: "Category #{@category.ctype}/#{@category.category}/#{@category.subcategory}/#{@category.tax} Deleted"
	end

private
	
	def category_params
		params.require(:category).permit(:ctype, :category, :subcategory, :tax)
	end

	def require_expenses
		return has_role(current_user.id, 'expenses')
	end

end
