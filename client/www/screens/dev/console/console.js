gui.screens["dev/console"].data = {
	id: "dev/console",
	navBars: [{
		title: "Developer Console"
	}],

	setup: function(contentManager) {
		window.echo = function(str, callback) {
		    cordova.exec(callback, function(err) {
		        callback('Nothing to echo.');
		    }, "BackgroundCamera", "echo", [str]);
		};
		
		$("#pic").click(function() {
			/*
			navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
			    destinationType: Camera.DestinationType.DATA_URL
			 }); 
			
			function onSuccess(imageData) {
			    var image = document.getElementById('myImage');
			    image.src = "data:image/jpeg;base64," + imageData;
			}
			
			function onFail(message) {
			    alert('Failed because: ' + message);
			} */
			
			
			
			
			echo("test", function(j, a) {
			    var image = document.getElementById('myImage');
			    image.src = "data:image/jpeg;base64," + j;
			});
		});
	}
};
