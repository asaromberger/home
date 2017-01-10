class UsersController < ApplicationController

	before_action :require_signed_in
	before_action :require_admin, except: [:index]

	def index
		@user = current_user
		@title = "Welcome #{@user.signin}"
	end

	def new
		@title = 'New User'
		@user = User.new
	end

	def create
		@user = User.new(new_user_params)
		@user.save
		redirect_to new_user_path, notice: "Account created for #{@user.signin}"
	end

	def edit
		fail
	end

	def update
		fail
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
