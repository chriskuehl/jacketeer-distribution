var sigPaths = [];
var penData = null;
var globalTension = 0.35;
var globalInterval = 0;
var num = 0;
var ctx = null;

gui.screens["distro/sign"].data = {
	id: "distro/sign",
	navBars: [{
		title: "Sign for Yearbook",
		
		buttons: {
			left: {
				type: "back",
				title: "Order List",
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
		penData = null;
		sigPaths = [];
		
		var canvas = $("#signCanvas");
		canvas.data("paths", []);
		ctx = canvas[0].getContext("2d");
		
		// load student data
		apiWithLoading("Loading order...", "order.php", {order: selectedOrderID}, function(data) {
			$(".studentName").text(data.FirstName + " " + data.LastName);
			num = data.Num;
			drawAgreement(ctx);
		});
		
		$(".signOK").click(function() {
			savePicture();
			
			dialog("Confirm Pickup", "Are you sure?", ["Cancel", "Confirm"], function(change) {				
				if (change) {
					var img = canvas[0].toDataURL("image/png");
					
					apiWithLoading("Saving signature...", "sign.php", {order: selectedOrderID, signature: img, staff: currentStudent}, function(data) {
						setScreen("distro/list");
					});
					
					savePicture();
				}
			});
		});
		
		$(".signClear").click(function() {
			penData = null;
			sigPaths = [];
			redrawCanvas(canvas, ctx);
		});
		
		// iPad touch events
		canvas[0].addEventListener("touchstart", function (e) {
			penData = {
				points: [],
				lastEvent: 0
			};

			// draw the first point
			addPenPosition(ctx, canvas, e);
			
			savePicture();
		}, false);

		canvas[0].addEventListener("touchmove", function (e) {
			// are we drawing?
			if (penData == null) {
				return;
			}

			// test if it's time for another point
			var cur = currentTime();
			var ignore = cur - penData.lastEvent < globalInterval;

			// draw the point
			addPenPosition(ctx, canvas, e, ignore);
		}, false);

		canvas[0].addEventListener("touchend", function (e) {
			// are we drawing?
			if (penData == null) {
				return;
			}

			// draw the last point
			try {
				addPenPosition(ctx, canvas, e);
			} catch (err) {}

			// remove any points to ignore
			for (var i = penData.points.length - 1; i >= 0; i--) {
				if (penData.points[i][3]) {
					penData.points.remove(i);
				}
			}

			// end the drawing
			sigPaths.push(penData.points);
			penData = null;
			lastPointIndex = (-1);

			redrawCanvas(canvas, ctx);
		}, false);

	}
};

function drawAgreement(ctx) {
	// draw agreement text on the canvas
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.font = "bold 34px Helvetica";
	
	var legalText = ["By signing, you certify: (1) you are either (a) the person whose name appears above or (b) a", "parent/guardian of that person and (2) you have received your " + num + " yearbook" + (num > 1 ? "s" : "") + "."];
	
	for (var i = 0; i < legalText.length; i ++) {
		ctx.fillText(legalText[i], 796, 50 + (i * 50));
	}
}

function currentTime() {
	return (new Date()).getTime();
}

var lastPointIndex = (-1);

function addPenPosition(ctx, canvas, e, ignore) {
	if (ignore === undefined) {
		ignore = false;
	}

	var pos = getPenPosition(canvas, e);
	var velocity = 0;

	if (penData.points.length > 0) {
		var lastPoint = penData.points[penData.points.length - 1];
		velocity = dist(pos, penData.points[lastPointIndex]);
	}

	pos.push(velocity);
	pos.push(ignore);
	penData.points.push(pos);

	if (!ignore) {
		lastPointIndex = penData.points.length - 1;
		penData.lastEvent = currentTime();
	}

	redrawCanvas(canvas, ctx);
}

function dist(p1, p2) {
	return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

function redrawCanvas(canvas, ctx) {
	// clear canvas
	ctx.clearRect(0, 0, canvas.width(), canvas.height());

	// draw the current path	
	if (penData) {
		drawSpline(ctx, penData.points, globalTension, false);
	}

	// draw the rest of the paths
	if (sigPaths.length > 0) {
		for (var i = 0; i < sigPaths.length; i++) {
			drawSpline(ctx, sigPaths[i], globalTension, false);
		}
	}
	
	// draw the agreement text
	drawAgreement(ctx);
}

function getPenPosition(canvas, e) {
	var ep = canvas.offset();
	return [e.targetTouches[0].pageX - ep.left, e.targetTouches[0].pageY - ep.top];
}

function savePicture() {
	if (! usingCamera) {
		return log("Not snapping picture (camera disabled).");
	}
	
	bgSnapPicture(function(b64) {
	    if (b64 != null) {
	    	api("save-image.php", {image: b64, order: selectedOrderID, name: selectedOrderName}, function() {
		    	log("Image saved.");
	    	}, true);
	    }
	});
}