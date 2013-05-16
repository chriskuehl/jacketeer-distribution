window.bgSnapPicture = function(callback) {
	log("Snapping picture...");
	
    cordova.exec(function(ret) {
    	console.log("Received callback in lib, sending to program...");
        callback(ret);
    }, function(err) {
    	console.log("Received error callback in lib, sending null to program...");
	    callback(null);
    }, "BackgroundCamera", "echo", ["a"]);
};