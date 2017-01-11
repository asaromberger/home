class UsersController < ApplicationController

	before_action :require_signed_in
	before_action :require_admin, only: [:new, :create]

	# landing page
	def index
		@user = current_user
		@title = "Welcome #{@user.signin}"
	end

	# Admin / Add a User
	def new
		@title = 'New User'
		@user = User.new
	end

	# Admin / Add a User
	def create
		@user = User.new(new_user_params)
		@user.save
		redirect_to new_user_path, notice: "Account created for #{@user.signin}"
	end

	def edit
		@title = 'Edit Sign in Name'
		@user = User.find(params[:id])
		unless @user.id == current_user.id
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	def update
		@user = User.find(params[:id])
		unless @user.id == current_user.id
			redirect_to root_url, alert: "inadequate permissions"
		end
		@user.signin = params[:user][:signin]
		@user.save
		redirect_to users_path, notice: "Sign in reset to #{@user.signin}"
	end

private

	def require_admin
		unless has_role(current_user.id, 'admin')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	def new_user_params
		params.require(:user).permit(:signin, :password, :password_confirmation)
	end

end
