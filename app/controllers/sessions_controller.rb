class SessionsController < ApplicationController

	before_action :require_signed_in, except: [:new, :create]

	def new
	end

	def create
		user = User.find_by(signin: params[:session][:signin].downcase)
		if user && user.authenticate(params[:session][:password])
			  sign_in user
			  redirect_to jiras_path, notice: "Welcome #{user.signin}"
		else
			  redirect_to new_session_path, alert: "Invalid signin/password combination"
		end
	end

	def destroy
			sign_out
			redirect_to root_url
	end

end
