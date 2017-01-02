module SessionsHelper

	def sign_in(user)
		remember_token = User.new_remember_token
		cookies[:remember_token] = { :value => remember_token }
		user.update_attribute(:remember_token, User.encrypt(remember_token))
		self.current_user = user
	end

	def current_user
		remember_token = User.encrypt(cookies[:remember_token])
		@current_user ||= User.find_by(remember_token: remember_token)
	end

	def signed_in?
		!current_user.nil?
	end

	def sign_out
		if current_user
			current_user.update_attribute(:remember_token, User.encrypt(User.new_remember_token))
		end
		cookies.delete(:remember_token)
		self.current_user = nil
		session[:intended_url] = nil
		session[:expire_at] = nil
	end

	def current_user=(user) # used by sign_out to set @current_user = nil
		@current_user = user
	end

	def require_signed_in
		unless signed_in?
			redirect_to signin_url, notice: "Please sign in"
		end
	end

	def has_role(user_id, role)
		if Permission.where("user_id = ? AND pkey = ?", user_id, role).count > 0
			return true
		else
			return false
		end
	end

end
