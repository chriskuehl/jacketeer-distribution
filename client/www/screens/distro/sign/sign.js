var sigPaths = [];
var penData = null;
var globalTension = 0.35;
var globalInterval = 0;

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
		var canvas = $("#signCanvas");
		canvas.data("paths", []);

		var ctx = canvas[0].getContext("2d");
		
		$(".signOK").click(function() {
			dialog("Confirm Pickup", "Are you sure?", ["Cancel", "Confirm"], function(change) {
				if (change) {
					setScreen("distro/list");
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
}

function getPenPosition(canvas, e) {
	var ep = canvas.offset();
	return [e.targetTouches[0].pageX - ep.left, e.targetTouches[0].pageY - ep.top];
}