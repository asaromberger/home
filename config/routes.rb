Rails.application.routes.draw do

	root 'sessions#new'

	resources :sessions
	match '/signout', to: 'sessions#destroy', via: :delete

	resources :jiras

	resources :users
	match '/users_password_reset', to: 'users#password_reset', via: :get
	match '/users_password_reset_update', to: 'users#password_reset_update', via: :put

	resources :categories
	match '/categoriesbulkinput', to: 'categories#bulkinput', via: :get
	match '/categoriesbulkinputupdate', to: 'categories#bulkinputupdate', via: :get

	resources :whats
	match '/whats_remap', to: 'whats#remap', via: :get
	match '/whats_remapupdate', to: 'whats#remapupdate', via: :put

	resources :what_maps

	resources :accountmaps

	resources :items

	resources :bulkinput

	resources :yearbudget

	resources :runningbudget

	resources :rentalcosts

	resources :transfers

	resources :unused

	resources :taxes

	resources :people

	resources :conversations

	resources :accounts

	match '/admin_roles', to: 'admin#roles', via: :get
	match '/admin_roles_edit', to: 'admin#roles_edit', via: :get
	match '/admin_roles_update', to: 'admin#roles_update', via: :get
	match '/admin_schema', to: 'admin#schema', via: :get

end
