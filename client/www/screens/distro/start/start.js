var isFlashing = false;

gui.screens["distro/start"].data = {
	id: "distro/start",
	navBars: [{
		title: "Distribution Console Credentials"
	}],

	setup: function(contentManager) {
		updateButtonText();
		
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
            
            currentStudent = name;
            setScreen("distro/list");
		});
		
		$(".toggleLocal").bind("touchstart", function() {
			if (isFlashing) {
				return false;
			}
			
			flashButton($(this));
			usingLocal = ! usingLocal;
			updateButtonText();
		});
		
		$(".toggleCamera").bind("touchstart", function() {
			if (isFlashing) {
				return false;
			}
			
			flashButton($(this));
			usingCamera = ! usingCamera;
			updateButtonText();
		});
	}
};

function flashButton(button) {
	isFlashing = true;
	
	button.animate({backgroundColor: "#EB612E"}, 100, "swing", function() {
		button.animate({backgroundColor: "#D95B1F"}, 100, "swing", function() {
			isFlashing = false;
		});
	});
}

function updateButtonText() {
	$(".toggleLocal").text("Turn Local " + (usingLocal ? "Off" : "On"));
	$(".toggleCamera").text("Turn Camera " + (usingCamera ? "Off" : "On")); 
}