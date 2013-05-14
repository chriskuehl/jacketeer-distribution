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
		});
		
		// load order list
		apiWithLoading("Loading orders...", "get-orders.php", {}, function(orders) {
			var ul = $(".students");
			
			for (var i = 0; i < orders.length; i ++) {
				var order = orders[i];
				var li = $("<li />");
				li.data("orderID", order.ID);
				li.text(order.LastName + ", " + order.FirstName);
				
				li.appendTo(ul);
				
			}
			
			ul.children().click(function() {
				if ($(this).data("orderID") > 0) {
					ul.children().removeClass("selected");
					$(this).addClass("selected");
					
					loadOrder($(this).data("orderID"));
				}
			})
			
			registerScrollContainers(ul.parent());
		});
		
		$(".searchName").bind("keydown keyup", filterStudentList);
		
		// handle voiding
		$(".voidPickup").click(function() {
			dialog("Invalidate Pickup", "Are you absolutely sure that you want to invalidate this pickup?\nTHIS CANNOT BE UNDONE.", ["Cancel", "Invalidate"], function(change) {
				if (change) {
					apiWithLoading("Invalidating signature...", "invalidate.php", {order: $(".pickup").data("orderID"), staff: currentStudent}, function(data) {
						loadOrder($(".pickup").data("orderID"));
					});
				}
			});
		});
		
		$(".pickup").click(function() {
			selectedOrderID = $(this).data("orderID");
			setScreen("distro/sign");
		});
	}
};

function loadOrder(orderID) {
	apiWithLoading("Loading order...", "order.php", {order: orderID}, function(data) {
		$(".studentName").text(data.FirstName + " " + data.LastName);
		$(".numberPurchased").text(data.Num);
		
		$(".noneSelected").hide();
		$(".whenSelected").show();
		
		$(".pickup").data("orderID", data.ID);
		
		if (data.PickedUp) {
			// user has signed
			$(".whenSelected").removeClass("notSigned");
			$(".datePickedUp").text(data.PickupTime);
			$(".sigPreview").css({
				backgroundImage: "url(\"http://jacketeer.org/" + data.PickupSignature + "\")",
				backgroundColor: "white",
				backgroundRepeat: "no-repeat",
				backgroundSize: "100% auto"
			});
		} else {
			// user has not signed
			$(".whenSelected").addClass("notSigned");
			$(".datePickedUp").text("N/A");
			$(".sigPreview").removeAttr("css");
		}
	});
}

function filterStudentList() {
	var term = $(".searchName").val().trim().toLowerCase();
	
	$(".students li").each(function(i, e) {
		var ee = $(e);
		var visible = term.length <= 0 || ee.text().toLowerCase().contains(term);
		ee.css("display", visible ? "block" : "none");
	});
	
	updateScrollContainers($(".students").parent());
}