class JirasController < ApplicationController

	before_action :require_signed_in
	before_action :require_jira

	def index
		@title = 'Jira'
		@jiras = Jira.where("status != 'complete'").order('priority, id')
		@jirascomplete = Jira.where("status = 'complete'").order('id')
	end

	def new
		@title = 'New Jira Item'
		@jira = Jira.new
	end

	def create
		@jira = Jira.new(jira_params)
		@jira.status = 'new'
		if @jira.save
			redirect_to jiras_path, notice: 'Item Created'
		else
			redirect_to jiras_path, notice: 'Failed to Create Item'
		end
	end

	def edit
		@title = 'Edit Jira Item'
		@jira = Jira.find(params[:id])
		@statuses = [['new', 'new'], ['working', 'working'], ['complete', 'complete']]
	end

	def update
		@jira = Jira.find(params[:id])
		if @jira.update(jira_params)
			redirect_to jiras_path, notice: 'Item Updated'
		else
			redirect_to jiras_path, notice: 'Failed to Updated Item'
		end
	end

private

	def require_jira
		unless has_role(current_user.id, 'jira')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

	def jira_params
		params.require(:jira).permit(:summary, :status, :description, :priority)
	end

end
