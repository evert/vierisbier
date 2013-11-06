// Put event listeners into place
window.addEventListener("DOMContentLoaded", function() {
	// Grab elements, create settings, etc.
	var canvas = document.getElementById("canvas"),
		context = canvas.getContext("2d"),
		video = document.getElementById("video"),
		videoObj = { "video": true },
		errBack = function(error) {
			console.log("Video capture error: ", error.code); 
		};

	// Put video listeners into place
	if(navigator.getUserMedia) { // Standard
		navigator.getUserMedia(videoObj, function(stream) {
			video.src = stream;
			video.play();
			setTimeout(function(){ $("#vierisbierapp").addClass("user-media");} ,1000);
		}, errBack);
	} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
		navigator.webkitGetUserMedia(videoObj, function(stream){
			video.src = window.webkitURL.createObjectURL(stream);
			video.play();
			setTimeout(function(){ $("#vierisbierapp").addClass("user-media");} ,1000);
		}, errBack);
	}

	// Trigger photo take
	$(".snap").on("click", function() {
		context.drawImage(video, 0, 0, 120, 120);
	});
}, false);