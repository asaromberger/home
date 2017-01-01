Rails.application.routes.draw do

	root 'sessions#new'

	resources :sessions
	resources :jiras
	resources :users

	match '/signout', to: 'sessions#destroy', via: :delete

end
