Rails.application.routes.draw do

	root 'sessions#new'

	resources :sessions
	resources :jiras
	resources :users
	resources :categories
	resources :whats
	resources :items

	match '/signout', to: 'sessions#destroy', via: :delete

	match '/admin_roles', to: 'admin#roles', via: :get
	match '/admin_roles_edit', to: 'admin#roles_edit', via: :get
	match '/admin_roles_update', to: 'admin#roles_update', via: :get
	match '/admin_schema', to: 'admin#schema', via: :get

end
