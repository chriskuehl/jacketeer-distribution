// handles core features (e.g. logging, device management)
// logging
var logRecord = "Welcome to the Jackteer distribution console.";

function dd(str) {
	str = str.toString();

	if (str.length < 2) {
		return "0" + str;
	}

	return str;
}

function log(msg) {
	return false;
	
	var now = new Date();
	msg = "[" + dd(now.getHours()) + ":" + dd(now.getMinutes()) + ":" + dd(now.getSeconds()) + "]: " + msg;

	logRecord += "<br />" + msg;
	console.log(msg);

	var logs = $(".logContainer");

	if (logs[0]) {
		logs.html(logRecord);
		logs.scrollTop(logs[0].scrollHeight);
	}
}
