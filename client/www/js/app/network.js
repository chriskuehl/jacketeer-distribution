// response code constants
RESP_OK = 200;

RESP_MISSING_BAD_PARAMS = 400;
RESP_SET_PASSWORD_FIRST = 401;
RESP_BAD_LOGIN_INFO = 402;
RESP_LOGIN_FIRST = 403;
RESP_NOT_AVAILABLE = 404;
RESP_UPGRADE_APP = 406;
RESP_HIT_RATE_LIMIT = 429;

RESP_UNABLE_TO_PERFORM_command = 450;

RESP_SERVER_ERROR = 500;

// helper methods

function api(command, params, callback, dontComplainOnFailure) {
	log("Making API request for \"" + command + "\".");
	
	params.temp = Math.floor(Math.random() * 10000000);
	params.appVersion = APP_VERSION;

	$.ajax({
		url: (usingLocal ? "http://10.224.91.86/" : "http://jacketeer.org/") + command,
		data: params,
		crossDomain: false,
		cache: false,
		timeout: 5000,
		type: "POST",
		
		success: function(data) {
			log("Received response for command \"" + command + "\".");
			callback(data);
		},

		error: function() {
			// hard error: internal server error, network down, etc.
			log("Encountered network error for command \"" + command + "\".");
			
			if (! dontComplainOnFailure) {
				dialog("Network Error", "We encountered a network error. Please make sure your internet is working properly. Would you like to try again?", ["Cancel", "Try Again"], function(tryAgain) {
					if (tryAgain) {
						// recurse
						api(command, params, callback);
					} else {
						networkReset();
					}
				});
			}
		}
	});
}

// convenience function for API requests with a loading screen
function apiWithLoading(text, command, params, callback) {
	showLoading(text);

	api(command, params, function(data) {
		callback(data);
		hideLoading();
	}, false);
}

function networkReset() {
	$("body").html("");
}
