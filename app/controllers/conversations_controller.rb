class ConversationsController < ApplicationController

	before_action :require_signed_in
	before_action :require_conversations

	def index
		@title = "Conversations for"
		@person = Person.find(params[:id])
		@conversations = Conversation.where("person_id = ?", @person.id).order('date DESC')
	end

	def new
		@person = Person.find(params[:person])
		@title = "Add a conversation for #{@person.name}"
		@conversation = Conversation.new
		@conversation.date = Date.today
		@conversation.scheduled = Date.today
	end

	def create
		@conversation = Conversation.new(conversation_params)
		@conversation.person_id = params[:person]
		if @conversation.save
			redirect_to people_path, notice: "Conversation Added"
		else
			redirect_to people_path, alert: "Failed to add Conversation"
		end
	end

	def edit
		@person = Person.find(params[:person])
		@title = "Update a conversation for #{@person.name}"
		@conversation = Conversation.find(params[:id])
	end

	def update
		@conversation = Conversation.find(params[:id])
		if @conversation.update(conversation_params)
			redirect_to people_path, notice: "Conversation Added"
		else
			redirect_to people_path, alert: "Failed to add Conversation"
		end
	end

	def destroy
		@conversation = Conversation.find(params[:id])
		@conversation.delete
		redirect_to people_path, notice: "Conversation Deleted"
	end

private

	def conversation_params
		params.require(:conversation).permit(:date, :note, :scheduled)
	end

	def require_conversations
		unless has_role(current_user.id, 'conversations')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
