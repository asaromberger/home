class AdminController < ApplicationController

	before_action :require_signed_in
	before_action :require_admin

	def roles
		@title = 'Roles Administration'
		@user = User.find(current_user)
	end

	def roles_edit
		@user = User.find_by(signin: params[:signin])
		if @user
			@roles = ['admin', 'jira', 'expenses']
			@values = Hash.new
			@roles.each do |role|
				p = Permission.where("user_id = ? AND pkey = ?", @user.id, role)
				if p.count > 0
					@values[role] = true
				else
					@values[role] = false
				end
			end
		else
			redirect_to admin_roles_path, alert: "No such user: #{params[:signin]}"
		end
	end

	def roles_update
		@user = User.find(params[:id])
		['admin', 'jira', 'expenses'].each do |role|
			if params[role] == 'on'
				if Permission.where("user_id = ? and pkey = ?", @user.id, role).count == 0
					p = Permission.new
					p.user_id = @user.id
					p.pkey = role
					p.save
				end
			else
				p = Permission.where("user_id = ? and pkey = ?", @user.id, role)
				if p.count
					p.first.delete
				end
			end
		end
		redirect_to admin_roles_path, notice: "Roles updated"
	end

private
	
	def require_admin
		return has_role(current_user.id, 'admin')
	end

end