Rails.application.routes.draw do

	root 'jiras#index'

	resources :jiras

end
