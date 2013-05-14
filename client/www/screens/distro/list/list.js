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
					
					apiWithLoading("Loading order...", "order.php", {order: $(this).data("orderID")}, function(data) {
						$(".studentName").text(data.FirstName + " " + data.LastName);
						$(".numberPurchased").text(data.Num);
						
						$(".noneSelected").hide();
						$(".whenSelected").show();
						
						if (data.PickedUp) {
							// user has signed
							$(".whenSelected").removeClass("notSigned");
							$(".datePickedUp").text(data.PickupTime);
						} else {
							// user has not signed
							$(".pickup").data("orderID", data.ID);
							
							$(".whenSelected").addClass("notSigned");
							$(".datePickedUp").text("N/A");
						}
					});
				}
			})
			
			registerScrollContainers(ul.parent());
		});
		
		// handle voiding
		$(".voidPickup").click(function() {
			dialog("Void Pickup", "Are you absolutely sure that you want to void this pickup?\nTHIS CANNOT BE UNDONE.", ["Cancel", "Void Pickup"], function(change) {
				if (change) {
					alert("ok voided");
				}
			});
		});
		
		$(".pickup").click(function() {
			selectedOrderID = $(this).data("orderID");
			setScreen("distro/sign");
		});
	}
};