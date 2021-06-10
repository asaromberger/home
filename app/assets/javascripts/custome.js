// HAL ADDITIONS

// toggle a hidden element - used for Instructions
function togglehidden(id) {
	el = document.getElementById(id);
	if (el.style.display != 'none') {
		el.style.display = 'none';
	} else {
		el.style.display = '';
	}
}

// toggle all check boxes on a page
function toggle_checkboxes(value) {
	var checkboxes = document.querySelectorAll("input[type='checkbox']");
	var i;
	var length = checkboxes.length;
	for (i = 0; i < length; i++) {
		checkboxes[i].checked = value;
	}
}

/*
	autosave is used to periodically save a form
		formname - the name of the form
		pageurl - the page URL
		posturl - the post URL for sending the ajax request
	it needs the following support in the view:
		<%= render
*/
function autosave(formname, pageurl, posturl) {
	var data = $(formname).serialize();
	if (window.location.pathname === pageurl) {
		$.ajax({
			beforeSend: function(xhr) {xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))},
			type:"PUT",
			 url: posturl,
			 data: data,
			 dataType: "json",
			 success: function(reply) {
			 	$('#autosavebox').css('background-color', 'green');
				$('#autosavebox').css('color', 'white');
				$('#autosavebox').text(reply["message"])
			 },
			 error: function(jqxdr, reply, status) {
			 	$('#autosavebox').css('background-color', 'red');
				$('#autosavebox').css('color', 'white');
				$('#autosavebox').text("Failed autosave")
			 }
		});
		setTimeout(function() {
			autosave(formname, pageurl, posturl);
		}, 30000);
	}
}

/*
	return to top
*/
function scrollFunction() {
	scrollbutton = document.getElementById("returntotop");
	if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
		scrollbutton.style.display = "block";
	} else {
		scrollbutton.style.display = "none";
	}
}
function returntotop() {
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
}
