class WhatMapsController < ApplicationController

	before_action :require_signed_in
	before_action :require_expenses

	def index
		@title = 'Whatmap Map'
		@whatmaps = WhatMap.all.order('whatmap')
	end

	def new
		@title = 'New WhatMap Map'
		@whatmap = WhatMap.new
		@whats = What.all.order('what')
	end

	def create
		@whatmap = WhatMap.new(whatmap_params)
		if @whatmap.save
			redirect_to what_maps_path, notice: "WhatMap #{@whatmap.whatmap} Added"
		else
			redirect_to what_maps_path, alert: 'Failed to create WhatMap Map'
		end
	end

	def edit
		@title = 'Edit WhatMap Map'
		@whatmap = WhatMap.find(params[:id])
		@whats = What.all.order('what')
	end

	def update
		@whatmap = WhatMap.find(params[:id])
		if @whatmap.update(whatmap_params)
			redirect_to what_maps_path, notice: "WhatMap #{@whatmap.whatmap} Updated"
		else
			redirect_to what_maps_path, alert: 'Failed to udate WhatMap map'
		end
	end

	def destroy
		@whatmap = WhatMap.find(params[:id])
		@whatmap.delete
		redirect_to what_maps_path, notice: "WhatMap #{@whatmap.whatmap} Deleted"
	end

private
	
	def whatmap_params
		params.require(:what_map).permit(:whatmap, :what_id)
	end

	def require_expenses
		unless has_role(current_user.id, 'expenses')
			redirect_to root_url, alert: "inadequate permissions"
		end
	end

end
