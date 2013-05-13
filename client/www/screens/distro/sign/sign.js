gui.screens["distro/sign"].data = {
	id: "distro/sign",
	navBars: [{
		title: "Sign for Yearbook",
		
		buttons: {
			left: {
				type: "back",
				title: "Student List",
				action: function() {
					setScreen("distro/list");
				}
			}
		}
	}],
	parents: ["distro/start", "distro/list"],

	setup: function(contentManager) {
		
	}
};