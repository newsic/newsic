/*
	                         _
	                        (_)
	 _ __   _____      _____ _  ___
	| '_ \ / _ \ \ /\ / / __| |/ __|
	| | | |  __/\ V  V /\__ \ | (__
	|_| |_|\___| \_/\_/ |___/_|\___|

	=================================

	Howdy, dear source code reader!

  	* Project page: https://newsic.tocsin.de
	* Demo: https://trynewsic.tocsin.de
	* newsic on GitHub: https://github.com/newsic/newsic

	* Author: Stephan Fischer (https://stephan-fischer.de)

*/

// set index to first array element or - if hash in url is set - to requested item
if (window.location.hash) {
	var i = window.location.hash.replace("#","");
} else {
	var i = 0;
}

var mindTheHash = function() {
	i = window.location.hash.replace("#","");
	jumpTo(i);
	setTitle(snippets[i]["title"]);1
}

window.onhashchange = mindTheHash;
var src;
var complete;

// some basic functions (triggered by GUI buttons or keyboard shortcuts)

var ElementInfoBlock = document.getElementById("info");

var toggleMessage = function() {
	ElementInfoBlock.style.visibility = "hidden";
	ElementInfoBlock.style.opacity = "0";
}

var showMessage = function(message, seconds) {

	// default value
	// sloppy fix for browser with antipathy for some es6 specifications (Safari *cough*)
	if (typeof(seconds) === "undefined") seconds = 10;

	ElementInfoBlock.innerHTML = message;
	ElementInfoBlock.style.visibility = "visible";
	ElementInfoBlock.style.opacity = "1";
	if(seconds > 0) {
		setInterval(toggleMessage, seconds * 1000);
	}

}

var playpause = function() {
	var ElementPlayPause = document.getElementById("playpause").getElementsByTagName("button")[0];
	if(video.paused()) {
		video.play();
		ElementPlayPause.className = "fa fa-pause";
	} else {
		video.pause();
		ElementPlayPause.className = "fa fa-play";
	}
}

var playcomplete = function() {
	video.currentTime(0);
	complete = true;
}

var playprevious = function() {
	i--;
	jumpTo(i, "prev");
	setTitle(snippets[i]["title"]);
}

var playnext = function() {
	i++;
	jumpTo(i, "next");
	setTitle(snippets[i]["title"]);
}

var setTitle = function(title) {
	document.getElementById("title").innerHTML = title;
	document.getElementsByTagName("title")[0].innerHTML = title + " - newsic";
}

// function for playing a single video
var jumpTo = function(index, prevOrNext) {
	if (typeof(prevOrNext) === "undefined") prevOrNext = "next";

	// check current location of user (for filtering region-blocked videos)
	var request = new XMLHttpRequest();
	request.open("GET", "https://geoip.nekudo.com/api/", true);


	request.onerror = function() {
		showMessage('The GeoIP service used by newsic is not available (perhaps due to an adblocker). Every video which is blocked somewhere will be skipped.', 0);

		if(snippets[i]["blocked"].length > 0 || snippets[i]["allowed"].length > 0) {

			if(i < snippets.length - 1) {
				if(prevOrNext == "prev" && i > 0) {
					playprevious();
				}
				else playnext();

			} else {
				i = 0;
				jumpTo(i);
				setTitle(snippets[i]["title"]);

				console.log("Rare case: The last video of the list is blocked, so we go to the first video. No one knows exactly why, but it seems to be the best.");

			}
		}
	};

	request.onload = function() {

	if (request.status === 200) {
			var data = JSON.parse(request.responseText);
			var playable = true;

			console.log("#" + i + ": " + snippets[i]["title"] + " - " + snippets[i]["id"]);

				if(typeof snippets[i]["blocked"] !== 'undefined' && snippets[i]["blocked"].length > 0 && snippets[i]["type"] == "youtube") {
					//alert("BLOCKED LIST");
					for(var bla = 0; bla < snippets[i]["blocked"].length; bla++) {
						if(snippets[i]["blocked"][bla] == data.country.code) {
							console.log("BLOCKED");
							showMessage("This video is blocked in some countries and yours is one of them. newsic skips this video.");

							//console.log("This video is blocked in some countries and yours is one of them. newsic skips this video.");
							playable = false;
							break;
						} /* else {
							//console.log("This video is blocked in some countries. But hey, you can watch it in your country. Have fun!");
							//break;
							//playable = true;
						} */
					}
				} else {

					if(typeof snippets[i]["allowed"] !== 'undefined' &&snippets[i]["allowed"].length > 0 && snippets[i]["type"] == "youtube") {
						playable = false;
						for(var bla2 = 0; bla2 < snippets[i]["allowed"].length; bla2++) {
							if(snippets[i]["allowed"][bla2] == data.country.code) {
								console.log("This video is allowed to watch in some countries only. But hey, you can watch it in your country. Have fun!");
								playable = true;
								break;
							} /* else {
								//playable = false;
								//showMessage("This video is allowed to watch in some countries only and yours isn't one of them. newsic skips this video.");
								//break;
								// */
						}
					}
				}

				if(!playable) {
					showMessage("Sorry, but this snippet isn't available in your country. (This seems to be the right time to blame organizations like GEMA, we guess.)");

					if(i < snippets.length - 1) {
						if(prevOrNext == "prev" && i > 0) {
							playprevious();
						}
						else playnext();

					} else {

						// please test
						this.pause();
						/* i = 0;
						jumpTo(i);
						setTitle(snippets[i]["title"]);

						console.log("The last video of the list is blocked, so we go to the first video."); */

					}
				}

		}

		/* else {
			//console.log("The GeoIP service returned an unexcepted value.");
			//alert("Shit is going on. Please select your country manually.");

			} */
	};

		request.send();


		// replace these two if blocks with switch case?

		// set src to YouTube URL format
		if(snippets[index]["type"] == "youtube") {
			src = "https://www.youtube.com/watch?v=" + snippets[index]["id"];
		}

		if(snippets[index]["type"] == "vimeo") {
			src = "https://vimeo.com/" + snippets[index]["id"];
		}

		video.src({
			type: "video/" + snippets[index]["type"],
			src: src
		});

		// needed to set the start time
		video.play();
		video.currentTime(snippets[index]["start"]);

		console.log("Jumped to start time.");
		console.log(snippets[index]["id"], snippets[index]["start"], snippets[index]["end"]);

		complete = false;

		// activates autoplay
		// video.play();

	};


// controls the VideoJS player
// youtube annotations are disabled by default ("iv_load_policy")
var video = videojs("video", {
	controls: true,
	techOrder: ["youtube", "vimeo"],
	"youtube": {"iv_load_policy": 3}
}, function() {

	// is triggered when bad stuff happens
	this.on("error", function() {
   		//console.log(this.error().message);
   		console.log("newsic player stopped. Message of blame sent.");
			this.pause();
   	});


	// start with the first video and insert the first title
	console.log("This is the beginning of a newsic session, the player is ready. Whoop whoop, fasten your seatbelts, etc.");
  jumpTo(i);
	setTitle(snippets[i]["title"]);

	// runs multiple times in a second when VideoJS plays video
  this.on("timeupdate", function() {

		// checks if this is the last video of the list
  	if(i < snippets.length) {
			if(complete) {
				var end = snippets[i]["length"] - 2;
				var start = 0;
			} else {
				var end = snippets[i]["end"];
				var start = snippets[i]["start"];
			}

			document.getElementById("seconds").innerHTML = Math.floor(end - this.currentTime());
			document.getElementById("colorcountdown").style.width = Math.floor(end - this.currentTime()) / (end - start) * 100 +  "%";

			// check if player reached specific end time of snippet
			//console.log(this.currentTime() + " " + end);
			//console.log(complete);

    	if (this.currentTime() >= end) {
    		console.log("End of snippet, let's go to the next one.");
				playnext();
    	}
    } else {
    	this.pause();
    	console.log("This party is over, now get out of here. Seriously.")
    }
	});

});

	document.getElementById("playprevious").onclick = playprevious;
	document.getElementById("playpause").onclick = playpause;
	document.getElementById("playnext").onclick = playnext;
	document.getElementById("playcomplete").onclick = playcomplete;

	// whole bunch of handy keyboard shortcuts (inspired by several popular video content provider *cough*)
	document.addEventListener("keydown", function(e)
	{

		// stop triggering input fields
		if (e.target.nodeName.toLowerCase() !== "input" && !e.ctrlKey && !e.altKey && !e.shiftKey) {

		// pressing "f": toggle fullscreen (todo: needs to be added to video player)
		if (e.which == 70) {
			if(video.isFullscreen()) {
				video.exitFullscreen();
			} else {
				video.requestFullscreen();
			}
		}

		// pressing "k" or space bar: toggle play/pause
		if(e.which == 75 || e.which == 32) {

			// prevent default behaviour (scrolling down the page)
			e.preventDefault();
			playpause();
		}

		// pressing "c": play complete snippet (todo: needs to be added to video player)
		if(e.which == 67) {
			playcomplete();
		}

		// pressing "a" or left arrow key: play previous snippet (todo: needs to be added to video player)
		if((e.which == 65 || e.which == 37) && i!=0) {
			playprevious();
		}

		// pressing "d" or right arrow key: play next snippet (todo: needs to be added to video player)
		if((e.which == 68 || e.which == 39) && i < snippets.length - 1) {
			playnext();
		}

	}
}
	, false);


	// for selecting a snippet manually (by clicking on specific thumbnail)
	var snippetlist = document.getElementById("snippets").children;

	for (var k = 0; k < snippetlist.length; k++) {
		snippetlist[k].onclick = function () {
			i = this.className.split(" ")[0];
			//console.log(i + " - " + snippets.length);

			jumpTo(i);
			setTitle(snippets[i]["title"]);
		}
	}
