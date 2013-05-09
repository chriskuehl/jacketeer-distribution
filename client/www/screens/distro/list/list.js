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
		
		// add some test data
		var ul = $(".students");
		
		for (var i = 1; i <= 250; i ++) {
			var li = $("<li />");
			li.text((i * Math.random() * 100000000000000).toString(16));
			
			li.appendTo(ul);
		}
		
		ul.children().click(function() {
			ul.children().removeClass("selected");
			$(this).addClass("selected");
			$(".noneSelected").hide();
		})
		
		registerScrollContainers(ul.parent());
	}
};