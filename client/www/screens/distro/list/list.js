gui.screens["distro/list"].data = {
	id: "distro/list",
	navBars: [{
		title: "Student List"
	}],
	parents: ["distro/start"],

	setup: function(contentManager) {
		$(".currentUser").text(currentStudent);
		$(".logout").click(function() {
			dialog("Change User", "Are you sure you want to change users?", ["Cancel", "Change User"], function(change) {
				if (change) {
					setScreen("distro/start");
				}
			});
		})
	}
};