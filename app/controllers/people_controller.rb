class PeopleController < ApplicationController

	before_action :require_signed_in
	before_action :require_conversations

	def index
		@title = "People"
		@people = Hash.new
		Person.where("user_id = ?", current_user.id).order('name').each do |person|
			@people[person.id] = Hash.new
			@people[person.id]['name'] = person.name
			conversation = Conversation.where("person_id = ?", person.id).order('date DESC')
			if conversation.count > 0
				conversation = conversation.first
				@people[person.id]['note'] = conversation.note
				@people[person.id]['lastcontact'] = conversation.date.to_s
				@people[person.id]['scheduled'] = conversation.scheduled.to_s
			else
				@people[person.id]['note'] = ''
				@people[person.id]['lastcontact'] = ''
				@people[person.id]['scheduled'] = ''
			end
		end
	end

	def new
		@title = "Add a person"
		@person = Person.new
	end

	def create
		@person = Person.new(person_params)
		@person.user_id = current_user.id
		if @person.save
			redirect_to people_path, notice: "#{@person.name} Added"
		else
			redirect_to people_path, alert: "Failed to add #{@person.name}"
		end
	end

	def edit
		@title = "Edit a person"
		@person = Person.find(params[:id])
	end

	def update
		@person = Person.find(params[:id])
		if @person.update(person_params)
			redirect_to people_path, notice: "#{@person.name} Updated"
		else
			redirect_to people_path, alert: "Failed to update #{@person.name}"
		end
	end

	def destroy
		@person = Person.find(params[:id])
		# delete conversations
		Conversation.where("person_id = ?", @person.id).delete_all
		# delete person
		@person.delete
	end

private

	def person_params
		params.require(:person).permit(:name)
	end

	def require_conversations
		unless has_role(current_user.id, 'conversations')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
