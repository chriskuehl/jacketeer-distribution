gui.screens["distro/start"].data = {
	id: "distro/start",
	navBars: [{
		title: "Distribution Console Credentials"
	}],

	setup: function(contentManager) {
		$(".fullName").keypress(function(e) {
			if (e.which == 13) {
				$(".continue").click();
				$(this).blur(); // hide the iPad keyboard

				e.preventDefault();
				return false;
			}
		});
		
		$(".continue").click(function() {
			var name = $(".fullName").val().trim();
			
			if (name.length < 3) {
				return dialog("Invalid Name", "Please use a valid name.", ["Sorry!"]);
            }
            
            if (name.indexOf(" ") <= (- 1)) {
				return dialog("Full Name Required", "Please use your full name.", ["Sorry!"]);
            }
            
            return alert("ok");
		});
	}
};
