gui.screens["distro/sign"].data = {
	id: "distro/sign",
	navBars: [{
		title: "Sign for Yearbook",
		
		buttons: {
			left: {
				type: "back",
				title: "Student List",
				action: function() {
					dialog("Cancel Pickup", "Are you sure you want to cancel collection? The student should not receive a yearbook without signing.", ["Stay Here", "Go Back"], function(change) {
						if (change) {
							setScreen("distro/list");
						}
					});
				}
			}
		}
	}],
	parents: ["distro/start", "distro/list"],

	setup: function(contentManager) {
		
	}
};