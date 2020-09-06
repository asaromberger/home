class AdminController < ApplicationController

	before_action :require_signed_in
	before_action :require_admin

	def roles
		@title = 'Roles Administration'
		@user = User.find(current_user.id)
	end

	def roles_edit
		@user = User.find_by(signin: params[:signin])
		if @user
			@roles = ['admin', 'jira', 'investments', 'expenses']
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
		['admin', 'jira', 'investments', 'expenses'].each do |role|
			if params[role] == 'on'
				if Permission.where("user_id = ? and pkey = ?", @user.id, role).count == 0
					p = Permission.new
					p.user_id = @user.id
					p.pkey = role
					p.save
				end
			else
				p = Permission.where("user_id = ? and pkey = ?", @user.id, role)
				if p.count > 0
					p.first.delete
				end
			end
		end
		redirect_to admin_roles_path, notice: "Roles updated"
	end

	def schema
		@title = 'Schema'
		@tables = Hash.new
		ActiveRecord::Base.connection.tables.sort.each do |table|
			if table != 'ar_internal_metadata' && table != 'schema_migrations'
				table_columns = table.classify.constantize.columns
				@tables[table] = table_columns
			end
		end
	end

	def datacheck
		@title = 'Data Check'
		@tables = Hash.new
		tables = ActiveRecord::Base.connection.tables.sort
		tables.each do |table|
			if table != 'ar_internal_metadata' && table != 'schema_migrations'
				tableref = table.classify.constantize
				tablename = tableref.name
				table_columns = tableref.columns
				@tables[tablename] = Hash.new
				@tables[tablename]['ref'] = tableref
				@tables[tablename]['columns'] = table_columns
				@tables[tablename]['ids'] = tableref.all.order('id').pluck('id')

			end
		end
		@tables.each do |name, table|
			tableref = table['ref']
			@tables[name]['xrefs'] = []
			@tables[name]['errors'] = []
			table['columns'].each do |column|
				col = column.name
				if col.match('_id$')
					xrefname = col.gsub(/_id$/, '')
					xref = xrefname.classify.constantize
					@tables[name]['errors'].push("References: #{xref.name}")
					tableref.where("#{col} NOT IN (?)", @tables[xref.name]['ids']).each do |t|
						@tables[name]['errors'].push("#{name}[#{t.id}]:#{col} = ${t.col} MISSING")
					end
				end
			end
		end
	end

private
	
	def require_admin
		unless has_role(current_user.id, 'admin')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
