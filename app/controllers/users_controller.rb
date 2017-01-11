class UsersController < ApplicationController

	before_action :require_signed_in
	before_action :require_correct_user, except: [:new, :create, :index]
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
	end

	def update
		@user.signin = params[:user][:signin]
		@user.save
		redirect_to users_path, notice: "Sign in reset to #{@user.signin}"
	end

	def password_reset
		@title = 'Reset Password'
		@user = User.find(params[:id])
	end

	def password_reset_update
		if @user.update_attributes(password_params)
			sign_in @user
			redirect_to users_path, notice: "Password Reset"
		else
			redirect_to users_path, notice: "Password Reset Failed"
		end
	end

private

	def require_correct_user
		@user = User.find(params[:id])
		unless current_user.id == @user.id
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	def require_admin
		unless has_role(current_user.id, 'admin')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	def new_user_params
		params.require(:user).permit(:signin, :password, :password_confirmation)
	end

	def password_params
		params.require(:user).permit(:password, :password_confirmation)
	end

end
