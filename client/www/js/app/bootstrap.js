var APP_VERSION = "7";
var PLATFORM = PLATFORM_IOS = 1; // helps maintain compatibility with BrowseRight, even though this app doesn't detect platform
var PLATFORM_PC = 0;

var usingLocal = false;
var usingCamera = true;

// bootstrap the app
$(document).ready(function() {
	start();
});

function start() {
	initialize();

	loadDefaultJavaScriptFiles(function() {
		startApp();
	});
}

// set up the app to a working state

function initialize() {
	console.log("Starting initialization process...");
	initInterface();
}

// handle JS loading

function loadDefaultJavaScriptFiles(callback) {
	var files = [
		"js/app/start.js"];

	loadJavaScriptFiles(files, callback);
}

function loadJavaScriptFiles(files, callback) {
	Loader.script(files, {
		complete: callback
	});
}
