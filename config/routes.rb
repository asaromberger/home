Rails.application.routes.draw do

	root 'sessions#new'

	resources :sessions

	resources :jiras

	resources :users
	match '/users_password_reset', to: 'users#password_reset', via: :get
	match '/users_password_reset_update', to: 'users#password_reset_update', via: :put

	resources :categories
	match '/categoriesbulkinput', to: 'categories#bulkinput', via: :get
	match '/categoriesbulkinputupdate', to: 'categories#bulkinputupdate', via: :get

	resources :whats

	resources :items

	resources :bulkinput
	match '/inputfromtracking', to: 'bulkinput#inputfromtracking', via: :get
	match '/inputfromquicken', to: 'bulkinput#inputfromquicken', via: :get

	match '/signout', to: 'sessions#destroy', via: :delete

	match '/admin_roles', to: 'admin#roles', via: :get
	match '/admin_roles_edit', to: 'admin#roles_edit', via: :get
	match '/admin_roles_update', to: 'admin#roles_update', via: :get
	match '/admin_schema', to: 'admin#schema', via: :get

end
