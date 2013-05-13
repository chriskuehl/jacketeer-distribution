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
			
			if (Math.random() < 0.5) {
				// user has signed
				$(".whenSelected").removeClass("notSigned");
				$(".datePickedUp").text("Tue May 22 @ 5:32 PM EST");
			} else {
				// user has not signed
				$(".whenSelected").addClass("notSigned");
				$(".datePickedUp").text("N/A");
			}
		})
		
		registerScrollContainers(ul.parent());
		
		// handle voiding
		$(".voidPickup").click(function() {
			dialog("Void Pickup", "Are you absolutely sure that you want to void this pickup?\nTHIS CANNOT BE UNDONE.", ["Cancel", "Void Pickup"], function(change) {
				if (change) {
					alert("ok voided");
				}
			});
		});
	}
};