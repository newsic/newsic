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

var ready = false;
var complete = false;
var muted = false;
var loop = false;
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

var controlsPlyr = [
    'mute',
    'volume',
    'play-large',
    'play',
    'progress',
    //'settings',
    'pip',
    'airplay',
    'fullscreen'
];

var i18nPlyr =  {
    // see: https://github.com/sampotts/plyr/blob/master/controls.md#example
    play: i18n_videohandler_play,
    pause: i18n_videohandler_pause,
    seek: i18n_videohandler_seek,
    buffered: i18n_videohandler_buffered,

    volume: i18n_videohandler_volume,

    // TODO: only togglemute implemented, seperate mute/unmute has to be set in play.html
    mute: i18n_videohandler_togglemute,
    unmute: i18n_videohandler_togglemute,

    // TODO: play.html needs sepeate versions for enter and exit
    enterFullscreen: i18n_videohandler_togglefullscreen,
    exitFullscreen: i18n_videohandler_togglefullscreen,
    
    // TODO:  translate
    //settings: 'Settings',
    //speed: 'Speed',
    //normal: 'Normal',
    //quality: 'Quality',
};

var optionsPlyr = {
    autoplay: autoplayPlyr,
    blankUrl: '/static/blank.mp4',
    debug: false,
    iconUrl: '/static/img/plyr/plyr-3.3.20.svg',
    keyboard: { global: false, focused: false },
    tooltips: { controls: true },
    captions: { active: false },
    controls: controlsPlyr,
    i18n: i18nPlyr,
    // Unsupported value of 'large' for quality
    //quality: { default: 'default', options: ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'default'] }
};

var video = new Plyr('.plyr', optionsPlyr);
video[0] = video;

var elementMessage = document.getElementsByClassName("message")[0];

// needs to be extended for new mini player (class "snippetinfo")
var elementPlayPause = document.getElementsByClassName("playPause")[0];
var snippets = document.getElementById("snippets").getElementsByTagName("a");

// debug function
var debugMessage = function(message, warn) {
    if (debug) {
        // default value
        if (typeof(warn) === "undefined") warn = false;
        
        if (warn) console.warn(message);
        else console.log(message);
    }
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

    elementMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i>' + " " + message;
    elementMessage.style.visibility = "visible";
    elementMessage.style.opacity = "1";
    if(seconds > 0) setInterval(toggleMessage, seconds * 1000);
}

var playPause = function() {
    video[0].togglePlay();

    var videoPaused = video[0].paused;

    newElement = document.createElement("i");

    if(videoPaused) {
        while (elementPlayPause.firstChild) {
            elementPlayPause.removeChild(elementPlayPause.firstChild);
        }
        newElement.classList = "fas fa-play";
        elementPlayPause.appendChild(newElement);
    } else {
        while (elementPlayPause.firstChild) {
            elementPlayPause.removeChild(elementPlayPause.firstChild);
        }
        newElement.classList = "fas fa-pause";
        elementPlayPause.appendChild(newElement);
    }
}

var playComplete = function() {
    video[0].pause();
    
    video[0].currentTime = 0;

    complete = true;
    video[0].play();
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
    var index;

    var firstCountdown = document.getElementsByClassName("countdown");
    if(firstCountdown.length > 1) firstCountdown[1].classList.toggle("countdown");

    var title = snippets[i].getElementsByClassName("name")[0].innerText;

    var countdown = document.createElement("div");
    countdown.classList.add("countdown");

    snippets[i].insertBefore(countdown, snippets[i].getElementsByTagName("p")[0]);

    document.getElementById("title").innerHTML = title;
    document.getElementsByTagName("title")[0].innerHTML = title + " - " + document.getElementById("snippets").dataset.playlisttitle + " - newsic";

    index = 0;

    document.getElementsByClassName("searchLyrics")[index].href = "https://genius.com/search?q=" + title.replace(/\s+/g, '+');
    document.getElementsByClassName("playMix")[index].href = "/" + snippets[i].dataset.type + "/mix/" + snippets[i].dataset.id;
}

// switching source
var jumpTo = function(index) {
    video[0].source = {
        type: "video",
        sources: [{
            src: snippets[index].dataset.id,
            provider: snippets[index].dataset.type
        }]
    };
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

var PlyrCustomButton = function(className, before, dataPlyr, fontawesome, labeltext) {
    var reference = document.getElementsByClassName("plyr__controls")[0].querySelector(before);

    var element = document.createElement("button");
    element.classList = "plyr__control " + className;
    element.setAttribute("data-plyr", dataPlyr);
    element.setAttribute("type", "button");
    element.setAttribute("aria-label", label);

    var icon = document.createElement("span");
    icon.classList = fontawesome;

    var label = document.createElement("span");
    label.classList = "label plyr__tooltip";
    label.setAttribute("role", "tooltip");
    label.textContent = labeltext;

    element.appendChild(icon);
    element.appendChild(label);

    reference.parentNode.insertBefore(element, reference);
}

video[0].on("ready", function() {

    // TODO: test whether video[0].pause() is still needed
    // omits playing video before setting offset time
    video[0].pause();

    complete = false;

    PlyrCustomButton("playPrevious", "[data-plyr=play]", "backward", "fas fa-backward", i18n_videohandler_previoussnippet);
    PlyrCustomButton("playNext", "div.plyr__progress", "backward", "fas fa-forward", i18n_videohandler_nextsnippet);

    // these buttons were placed before settings menu ("[data-plyr=settings]")
    PlyrCustomButton("playComplete", "[data-plyr=fullscreen]", "complete", "fas fa-plus-square", i18n_videohandler_completesnippet);
    PlyrCustomButton("playMix", "[data-plyr=fullscreen]", "mix", "fas fa-random", i18n_videohandler_mix);
    PlyrCustomButton("searchLyrics", "[data-plyr=fullscreen]", "lyrics", "fas fa-file-alt", i18n_videohandler_lyrics);

    // TODO: could be put into an array, then onclick bindings could be solved by foreach
    playPreviousElements = document.getElementsByClassName("playPrevious");
    playNextElements = document.getElementsByClassName("playNext");
    playCompleteElements = document.getElementsByClassName("playComplete");
    playMixElements = document.getElementsByClassName("playMix");
    searchLyricsElements = document.getElementsByClassName("searchLyrics");

    for (var temp = 0; temp < 2; temp++) {
        playPreviousElements[temp].onclick = playPrevious;
        playNextElements[temp].onclick = playNext;
        playCompleteElements[temp].onclick = playComplete;
        playMixElements[temp].onclick = playMix;
        searchLyricsElements[temp].onclick = searchLyrics;
    }

    playPauseElements = document.getElementsByClassName("playPause");
    for (var temp = 0; temp < 1; temp++) {
        playPauseElements[temp].onclick = playPause;
    }

    if(snippets[i].dataset.type === "vimeo") ready = true;

    if(snippets[i].dataset.type === "youtube") {
        video.currentTime = parseFloat(snippets[i].getAttribute("data-start"));
    }

        debugMessage("Jumped to start time.");
        debugMessage(snippets[i].dataset.id + " " +  snippets[i].dataset.start + " " + snippets[i].dataset.end);

        // handle newsic's autoplay setting (affects first snippet only)
        if(!autoplayFirstVideo && !location.hash && i === 0 && prevOrNext != "prev") {
            video[0].pause();
        } else video[0].play();

        if (!muted) video[0].muted = false;
    }
);


video[0].on("playing", function() {

    while (elementPlayPause.firstChild) {
        elementPlayPause.removeChild(elementPlayPause.firstChild);
    }
    newElement = document.createElement("i");
    newElement.classList = "fas fa-pause";
    elementPlayPause.appendChild(newElement);

    if(snippets[i].dataset.type === "vimeo" && ready) {

        console.log("playing event");

        video.currentTime = parseFloat(snippets[i].getAttribute("data-start"));

        debugMessage("Jumped to start time.");
        debugMessage(snippets[i].dataset.id + " " +  snippets[i].dataset.start + " " + snippets[i].dataset.end);
        ready = false;
    }
});


video[0].on("pause", function() {
    while (elementPlayPause.firstChild) {
        elementPlayPause.removeChild(elementPlayPause.firstChild);
    }
    newElement = document.createElement("i");
    newElement.classList = "fas fa-play";
    elementPlayPause.appendChild(newElement);
});


video[0].on("error", function(error) {

    // TODO: update for Plyr 3
    // problems with Vimeo -> don't skip videos on error

    var title = snippets[i].getElementsByClassName("name")[0].innerText;
    if(snippets[i].dataset.type == "youtube") {
        debugMessage("Error: " + error["detail"]["code"]);

        // see https://developers.google.com/youtube/iframe_api_reference?hl=de#Events
        if(error["detail"]["code"] == 150 || error["detail"]["code"] == 101) {
            showMessage(title + ": " + i18n_videohandler_embeddingforbidden);
        } else showMessage(title + ": " + i18n_videohandler_blocked);

        if(prevOrNext == "prev") playPrevious();
        else playNext();
    }
});


// runs multiple times in a second when plyr plays video
video[0].on("timeupdate", function() {

    // checks if this is the last video of the list
    if(i < snippets.length) {

        var end = parseFloat(snippets[i].dataset.end);
        var start = parseFloat(snippets[i].dataset.start);

        if(complete) {
            end = parseFloat(snippets[i].dataset.length);
            start = 0;
        }

        var countdowns = document.getElementsByClassName("countdown");

        // TODO: make it go to zero
        var videoCurrentTime = video[0].currentTime;

        var countdownWidth = Math.floor(end - videoCurrentTime) / (end - start) * 100 +  "%";
        
        countdowns[0].style.width = countdowns[1].style.width = countdownWidth;

        // check if player reached end of snippet
        if (Math.ceil(videoCurrentTime) >= end) {

            //video[0].pause();

            if(loop) {
                video[0].currentTime = start;
            } else {
                if(i == (snippets.length - 1)) {
                    video[0].pause();
                    debugMessage("This party is over, now get out of here. Seriously.");
                } else {
                    debugMessage("End of snippet, let's go to the next one.");
                    playNext();
                }
            }
        }
    }
});

// init function
// TODO: rename to something more clear
mindTheHash();
window.onhashchange = mindTheHash;

// whole bunch of handy keyboard shortcuts (inspired by several popular video content provider *cough*)
document.addEventListener("keydown", function(e) {

    // stop triggering input fields
    if (e.target.nodeName.toLowerCase() !== "input" && !e.ctrlKey && !e.altKey && !e.shiftKey) {

        switch (e.key) {
            // "f": toggle fullscreen
            case "f":
                video[0].fullscreen.toggle();
                break;

            // "l": search for lyrics
            case "l":
                searchLyrics();
                break;

            // "m": toggle mute
            case "m":
                video[0].muted = !video[0].muted;
                muted = !muted;
                break;

            // TODO: find a better shortcut key
            // "y": toggle loop
            case "y":
                loop = !loop;
                break;
                
            // "x": start mix
            case "x":
                playMix();
                break;

            // "k", "s" or space bar: toggle play/pause
            case "k":
            case "s":
            case " ":
                // prevent page from scrolling down
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