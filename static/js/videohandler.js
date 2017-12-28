/*
                             _
                            (_)
     _ __   _____      _____ _  ___
    | '_ \ / _ \ \ /\ / / __| |/ __|
    | | | |  __/\ V  V /\__ \ | (__
    |_| |_|\___| \_/\_/ |___/_|\___|

    =================================

    Video handling

    Howdy, dear source code reader!

    * Project page: https://newsic.tocsin.de
    * Demo: https://trynewsic.tocsin.de
    * newsic on GitHub: https://github.com/newsic

    * Author: Stephan Fischer (https://stephan-fischer.de, https://tocsin.de)

*/


/* Plyr version
Warning: Plyr 3 support in very early stage

Please remember to change file requests in play.html template

Default: 2

*/
var plyrVersion = 2;


var ready = false;
var complete = false;
var prevOrNext = "next";
var i;

/* Debug mode
Toggle console.log messages.

Default: false

*/
var debug = true;

/* Autoplay
Will only affect first video.

Default: true

*/
var autoplayFirstVideo = true;

/* Plyr autoplay
Will affect autoplay of every single snippet.

Default: true

*/
var autoplayPlyr = true;

var controls = ["<div class='plyr__controls'>",

"<button class='playPrevious' type='button' data-plyr='backward'>",
    "<span class='fa fa-backward'></span>",
    "<span class='plyr__sr-only'>Previous snippet</span>",
"</button>",

"<button type='button' data-plyr='play'>",
    "<span class='fa fa-play'></span>",
    "<span class='plyr__sr-only'>Play</span>",
"</button>",

"<button type='button' data-plyr='pause'>",
    "<span class='fa fa-pause'></span>",
    "<span class='plyr__sr-only'>Pause</span>",
"</button>",

"<button class='playNext' type='button' data-plyr='forward'>",
    "<span class='fa fa-forward'></span>",
    "<span class='plyr__sr-only'>Next snippet</span>",
"</button>",

"<button type='button' data-plyr='mute'>",
    "<svg class='icon--muted'><use xlink:href='/static/img/plyr/plyr.svg#plyr-muted'></use></svg>",
    "<svg><use xlink:href='/static/img/plyr/plyr.svg#plyr-volume'></use></svg>",
    "<span class='plyr__sr-only'>Toggle mute</span>",
"</button>",

"<span class='plyr__volume'>",
    "<label for='volume{id}' class='plyr__sr-only'>Volume</label>",
    "<input id='volume{id}' class='plyr__volume--input' type='range' min='0' max='10' value='5' data-plyr='volume'>",
    "<progress class='plyr__volume--display' max='10' value='0' role='presentation'></progress>",
"</span>",

"<span class='plyr__progress'>",
    "<label for='seek{id}' class='plyr__sr-only'>Seek</label>",
    "<input id='seek{id}' class='plyr__progress--seek' type='range' min='0' max='100' step='0.1' value='0' data-plyr='seek'>",
    "<progress class='plyr__progress--played' max='100' value='0' role='presentation'></progress>",
    "<progress class='plyr__progress--buffer' max='100' value='0'>",
        "<span>0</span>% buffered",
    "</progress>",
    "<span class='plyr__tooltip'>00:00</span>",
"</span>",

"<button class='playComplete' type='button' data-plyr='complete'>",
    "<span class='fa fa-plus-square'></span>",
    "<span class='plyr__sr-only'>Complete snippet</span>",
"</button>",

"<button class='playMix' type='button' data-plyr='mix'>",
    "<span class='fa fa-random'></span>",
    "<span class='plyr__sr-only'>Mix</span>",
"</button>",

"<button class='searchLyrics' type='button' data-plyr='lyrics'>",
    "<span class='fa fa-file-text-o'></span>",
    "<span class='plyr__sr-only'>Lyrics</span>",
"</button>",

"<button type='button' data-plyr='fullscreen'>",
    "<svg class='icon--exit-fullscreen'><use xlink:href='/static/img/plyr/plyr.svg#plyr-exit-fullscreen'></use></svg>",
    "<svg><use xlink:href='/static/img/plyr/plyr.svg#plyr-enter-fullscreen'></use></svg>",
    "<span class='plyr__sr-only'>Toggle fullscreen</span>",
"</button>",

"</div>"].join("");

var options_plyr2 = {
    debug: false,
    autoplay: autoplayPlyr,
    iconUrl: '/static/img/plyr/plyr.svg',
    blankUrl: '/static/blank.mp4',
    html: controls,
    tooltips: { controls: true, seek: true },

    // "keyboardShorcuts" is a typo of Plyr 2, this will be fixed in Plyr 3
    // https://github.com/sampotts/plyr/issues/572#issuecomment-342144587
    keyboardShorcuts: { focused: false, global: false }
};

var options_plyr3 = {
    autoplay: autoplayPlyr,
    blankUrl: '/static/blank.mp4',
    debug: true,
    iconUrl: '/static/img/plyr/3/plyr.svg',
    keyboard: { global: false, focused: false },
    tooltips: { controls: true },
    captions: { active: false },
    controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'fullscreen'
    ]
};

// Plyr 2
if(plyrVersion == 2) {
    var video = plyr.setup('.plyr', options_plyr2);
}

// Plyr 3
if(plyrVersion == 3) {
    var video = new Plyr('.plyr', options_plyr3);
    video[0] = video;
}

var elementMessage = document.getElementsByClassName("message")[0];
var elementPlayPause = document.getElementsByClassName("playPause fa fa-play")[0];
var snippets = document.getElementById("snippets").children;

// debug function
var debugMessage = function(message) {
    if (debug) console.log(message);
}

// some basic functions (triggered by GUI buttons or keyboard shortcuts)
var toggleMessage = function() {
    elementMessage.style.visibility = "hidden";
    elementMessage.style.opacity = "0";
}

var showMessage = function(message, seconds) {
    // default value
    // sloppy fix for browser with antipathy for some es6 specifications (Safari *cough*)
    if (typeof(seconds) === "undefined") seconds = 10;

    elementMessage.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>' + " " + message;
    elementMessage.style.visibility = "visible";
    elementMessage.style.opacity = "1";
    if(seconds > 0) setInterval(toggleMessage, seconds * 1000);
}

var playPause = function() {
    video[0].togglePlay();

    // Plyr 2
    if(plyrVersion == 2) {
        var videoPaused = video[0].isPaused();
    }

    // Plyr 3
    if(plyrVersion == 3) {
        var videoPaused = video[0].paused;
    }

    if(videoPaused) elementPlayPause.className = "playPause fa fa-play";
    else elementPlayPause.className = "playPause fa fa-pause";
}

var playComplete = function() {
    
    // Plyr 2
    if(plyrVersion == 2) {
        video[0].seek(0);
    }

    // Plyr 3
    if(plyrVersion == 3) {
        video[0].currentTime = 0;
    }

    complete = true;
}

var playPrevious = function() {
    if(i > 0) {
        prevOrNext = "prev";
        i--;
        jumpTo(i);
        updateElements();
    }
}

var playNext = function() {
    if(i < snippets.length - 1) {
        prevOrNext = "next";
        i++;
        jumpTo(i);
        updateElements();
    }
}

var playMix = function() {
    window.open(document.getElementsByClassName("playMix")[1].href, "_self");
}

var searchLyrics = function() {
    window.open(document.getElementsByClassName("searchLyrics")[1].href, "blank");
}

var updateElements = function() {
    var firstCountdown = document.getElementsByClassName("countdown");
    if(firstCountdown.length > 1) firstCountdown[1].classList.toggle("countdown");

    var title = snippets[i].getElementsByClassName("name")[0].innerText;

    var countdown = document.createElement("div");
    countdown.classList.add("countdown");

    snippets[i].insertBefore(countdown, snippets[i].getElementsByTagName("p")[0]);

    document.getElementById("title").innerHTML = title;
    document.getElementsByTagName("title")[0].innerHTML = title + " - " + document.getElementById("snippets").dataset.playlisttitle + " - newsic";

    // Plyr 2
    if(plyrVersion == 2) {
        document.getElementsByClassName("searchLyrics")[1].href = "https://genius.com/search?q=" + title.replace(/\s+/g, '+');
    }

    // Plyr 3
    if(plyrVersion == 3) {
        document.getElementsByClassName("searchLyrics")[0].href = "https://genius.com/search?q=" + title.replace(/\s+/g, '+');
    }


    // TODO: simplify (URL is built the same way, just switch between provider)

    // Plyr 2
    if(plyrVersion == 2) {
        if(snippets[i].dataset.type == "youtube") document.getElementsByClassName("playMix")[1].href = "/youtube/mix/" + snippets[i].dataset.id;
        if(snippets[i].dataset.type == "vimeo") document.getElementsByClassName("playMix")[1].href = "/vimeo/mix/" + snippets[i].dataset.id;
    }

    // Plyr 3
    if(plyrVersion == 3) {
        if(snippets[i].dataset.type == "youtube") document.getElementsByClassName("playMix")[0].href = "/youtube/mix/" + snippets[i].dataset.id;
        if(snippets[i].dataset.type == "vimeo") document.getElementsByClassName("playMix")[0].href = "/vimeo/mix/" + snippets[i].dataset.id;
    }
}

// switching source
var jumpTo = function(index) {

    // Plyr 2
    if(plyrVersion == 2) {
        video[0].source({
            type: "video",
            sources: [{
                src: snippets[index].dataset.id,
                type: snippets[index].dataset.type
            }]
        });
    }

    // Plyr 3
    if(plyrVersion == 3) {
        video[0].source = {
            type: "video",
            sources: [{
                src: snippets[index].dataset.id,
                provider: snippets[index].dataset.type
            }]
        };
    }
}


var mindTheHash = function() {
    // set index to first array element or - if hash in url is set - to requested item
    if (location.hash) {
        debugMessage("Hash is set");
        var input = window.location.hash.replace("#","");
		if(input < snippets.length) i = input; 
		else  i = window.location.hash = snippets.length-1;  // if hash > no. of videos
    } else i = 0; // no hash

    debugMessage("This is the beginning of a newsic session, the player is ready. Whoop whoop, fasten your seatbelts, etc.");
    jumpTo(i);
    updateElements();
};

video[0].on("ready", function() {
    complete = false;

    // handle newsic's autoplay setting (affects first snippet only)
    if(!autoplayFirstVideo && !location.hash && i === 0 && prevOrNext != "prev") {
        video[0].pause();
    } else //video[0].play();

    if(snippets[i].dataset.type === "vimeo") {
        ready = true;
    }

    if(snippets[i].dataset.type === "youtube") {

        // Plyr 2
        if(plyrVersion == 2) {
            video[0].seek(parseFloat(snippets[i].getAttribute("data-start")));
        }

        // Plyr 3
        if(plyrVersion == 3) {

            // TODO: fix
            video[0].currentTime = parseFloat(snippets[i].getAttribute("data-start")).toFixed(2);
            //video[0].currentTime = snippets[i].getAttribute("data-start").toFixed;
        }
        debugMessage("Jumped to start time.");
        debugMessage(snippets[i].dataset.id + " " +  snippets[i].dataset.start + " " + snippets[i].dataset.end);
    }
});


video[0].on("playing", function() {

    elementPlayPause.className = "playPause fa fa-pause";

    if(snippets[i].dataset.type === "vimeo" && ready) {

        // Plyr 2
        if(plyrVersion == 2) {
            video[0].seek(parseFloat(snippets[i].dataset.start));
        }

        // Plyr 3
        if(plyrVersion == 3) {
            video[0].currentTime = parseFloat(snippets[i].dataset.start).toFixed(2);
            video[0].play();
        }
        debugMessage("Jumped to start time.");
        debugMessage(snippets[i].dataset.id + " " +  snippets[i].dataset.start + " " + snippets[i].dataset.end);
        ready = false;
    }
});


video[0].on("error", function(error) {
    var title = snippets[i].getElementsByClassName("name")[0].innerText;
    if(snippets[i].dataset.type == "youtube") {
        debugMessage("Error: " + error["detail"]["code"]);

        // see https://developers.google.com/youtube/iframe_api_reference?hl=de#Events
        if(error["detail"]["code"] == 150 || error["detail"]["code"] == 101) {
            // TODO: insert title
            showMessage(title + ": Embedding forbidden or blocked in your country");
        } else showMessage("Sorry, but " + title + " isn't available in your country.");
    } else showMessage("Video skipped.");
    if(prevOrNext == "prev") playPrevious();
    else playNext();
});


video[0].on("pause", function() {
    elementPlayPause.className = "playPause fa fa-play";
});

// runs multiple times in a second when plyr plays video
video[0].on("timeupdate", function() {

    // checks if this is the last video of the list
    if(i < snippets.length) {

        var end = parseFloat(snippets[i].dataset.end);
        var start = parseFloat(snippets[i].dataset.start);

        if(complete) {
            end = snippets[i].dataset.length;
            start = 0;
        }

        var countdowns = document.getElementsByClassName("countdown");

        // TODO: make it go to zero

        // Plyr 2
        if(plyrVersion == 2) {
            var videoCurrentTime = video[0].getCurrentTime();
        }

        // Plyr 3
        if(plyrVersion == 3) {
            var videoCurrentTime = video[0].currentTime;
        }

        var countdownWidth = Math.floor(end - videoCurrentTime) / (end - start) * 100 +  "%";
        
        countdowns[0].style.width = countdowns[1].style.width = countdownWidth;

        // check if player reached end of snippet
        if (Math.ceil(videoCurrentTime) >= end) {

            //video[0].pause();

            if(i == (snippets.length - 1)) {
                video[0].pause();
                debugMessage("This party is over, now get out of here. Seriously.");
            } else {
                debugMessage("End of snippet, let's go to the next one.");
                playNext();
            }
        }
    }
});

// init function
// TODO: rename to something more clear
mindTheHash();
window.onhashchange = mindTheHash;

// TODO: the following code is working, but far from being good
playPreviousElements = document.getElementsByClassName("playPrevious");
playPauseElements = document.getElementsByClassName("playPause");
playNextElements = document.getElementsByClassName("playNext");
playCompleteElements = document.getElementsByClassName("playComplete");
playMixElements = document.getElementsByClassName("playMix");
searchLyricsElements = document.getElementsByClassName("searchLyrics");


// TODO: improve!1!eleven and use foreach
for (var temp = 0; temp < playPreviousElements.length; temp++) {
    playPreviousElements[temp].onclick = playPrevious;
}

for (var temp = 0; temp < playPauseElements.length; temp++) {
    playPauseElements[temp].onclick = playPause;
}

for (var temp = 0; temp < playNextElements.length; temp++) {
    playNextElements[temp].onclick = playNext;
}

for (var temp = 0; temp < playCompleteElements.length; temp++) {
    playCompleteElements[temp].onclick = playComplete;
}

// Plyr 2
if(plyrVersion == 2) {
    // only for first mix button (Plyr)
    playMixElements[0].onclick = playMix;
    // only for first lyric search button (Plyr)
    searchLyricsElements[0].onclick = searchLyrics;
}

// whole bunch of handy keyboard shortcuts (inspired by several popular video content provider *cough*)
document.addEventListener("keydown", function(e) {

    // stop triggering input fields
    if (e.target.nodeName.toLowerCase() !== "input" && !e.ctrlKey && !e.altKey && !e.shiftKey) {

        switch (e.key) {
            // "f": toggle fullscreen
            case "f":
                video[0].toggleFullscreen();
                break;

            // "l": search for lyrics
            case "l":
                searchLyrics();
                break;

            // "m": mute player
            case "m":
                video[0].toggleMute();
                break;

            // "x": start mix
            case "x":
                playMix();
                break;

            // "k", "s" or space bar: toggle play/pause
            case "k":
            case "s":
            case " ":
                // prevent scrolling down the page
                e.preventDefault();
                playPause();
                break;

            // "c": play complete snippet
            case "c":
                playComplete();
                break;
            
            // "a" or left arrow key: play previous snippet
            case "a":
            case "ArrowLeft":
                playPrevious();
                break;

            // "d" or right arrow key: play next snippet
            case "d":
            case "ArrowRight":
                playNext();
                break;
        }
    }
}
, false);