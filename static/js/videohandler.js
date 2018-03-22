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
Temporary variable (as long as transition to Plyr 3 lasts)
Please remember to change file requests in play.html template

Default: 3

*/
var plyrVersion = 3;


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

// TODO: translate
var controlsPlyr2 = ["<div class='plyr__controls'>",

"<button class='playPrevious' type='button' data-plyr='backward'>",
    "<span class='fas fa-backward'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_previoussnippet,
    "</span>",
"</button>",

"<button type='button' data-plyr='play'>",
    "<span class='fas fa-play'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_play,
    "</span>",
"</button>",

"<button type='button' data-plyr='pause'>",
    "<span class='fas fa-pause'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_pause,
    "</span>",
"</button>",

"<button class='playNext' type='button' data-plyr='forward'>",
    "<span class='fas fa-forward'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_nextsnippet,
    "</span>",
"</button>",

"<button type='button' data-plyr='mute'>",
    "<svg class='icon--muted'><use xlink:href='/static/img/plyr/plyr.svg#plyr-muted'></use></svg>",
    "<svg><use xlink:href='/static/img/plyr/plyr.svg#plyr-volume'></use></svg>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_togglemute,
    "</span>",
"</button>",

"<span class='plyr__volume'>",
    "<label for='volume{id}' class='plyr__sr-only'>",
    i18n_videohandler_volume,
    "</label>",
    "<input id='volume{id}' class='plyr__volume--input' type='range' min='0' max='10' value='5' data-plyr='volume'>",
    "<progress class='plyr__volume--display' max='10' value='0' role='presentation'></progress>",
"</span>",

"<span class='plyr__progress'>",
    "<label for='seek{id}' class='plyr__sr-only'>Seek</label>",
    "<input id='seek{id}' class='plyr__progress--seek' type='range' min='0' max='100' step='0.1' value='0' data-plyr='seek'>",
    "<progress class='plyr__progress--played' max='100' value='0' role='presentation'></progress>",
    "<progress class='plyr__progress--buffer' max='100' value='0'>",
        "<span>0</span>% ",
        i18n_videohandler_buffered,
    "</progress>",
    "<span class='plyr__tooltip'>00:00</span>",
"</span>",

"<button class='playComplete' type='button' data-plyr='complete'>",
    "<span class='fas fa-plus-square'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_completesnippet,
    "</span>",
"</button>",

"<button class='playMix' type='button' data-plyr='mix'>",
    "<span class='fas fa-random'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_mix,
    "</span>",
"</button>",

"<button class='searchLyrics' type='button' data-plyr='lyrics'>",
    "<span class='fas fa-file-alt'></span>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_lyrics,
    "</span>",
"</button>",

"<button type='button' data-plyr='fullscreen'>",
    "<svg class='icon--exit-fullscreen'><use xlink:href='/static/img/plyr/plyr.svg#plyr-exit-fullscreen'></use></svg>",
    "<svg><use xlink:href='/static/img/plyr/plyr.svg#plyr-enter-fullscreen'></use></svg>",
    "<span class='plyr__sr-only'>",
    i18n_videohandler_togglefullscreen,
    "</span>",
"</button>",

"</div>"].join("");

var controlsPlyr3 = ["<div class='plyr__controls'>",

"<button type='button' class='plyr__control playPrevious' data-plyr='forward' aria-label='",
    i18n_videohandler_previoussnippet,
    "'>",
    "<span class='fas fa-backward'></span>",
    "<span class='label plyr__tooltip' role='tooltip'>",
    i18n_videohandler_previoussnippet,
    "</span>",
"</button>",


'<button type="button" class="plyr__control" aria-pressed="false" aria-label="Play" data-plyr="play"><svg class="icon--pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-pause"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-play"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Pause</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span></button>',

"<button type='button' class='plyr__control playNext' data-plyr='forward' aria-label='",
    i18n_videohandler_nextsnippet,
    "'>",
    "<span class='fas fa-forward'></span>",
    "<span class='label plyr__tooltip' role='tooltip'>",
    i18n_videohandler_nextsnippet,
    "</span>",
"</button>",

'<button type="button" class="plyr__control" aria-pressed="true" aria-label="Mute" data-plyr="mute"><svg class="icon--pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-muted"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-volume"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span></button><div class="plyr__volume"><label for="plyr-volume-{id}" class="plyr__sr-only">Volume</label><input data-plyr="volume" min="0" max="1" step="0.05" value="0" autocomplete="off" id="plyr-volume-{id}" type="range"></div>',

// TODO: ids not set correctly
'<div class="plyr__progress"><label for="plyr-seek" class="plyr__sr-only">Seek</label><input data-plyr="seek" min="0" max="100" step="0.01" value="0" autocomplete="off" id="plyr-seek" type="range"><progress class="plyr__progress--buffer" min="0" max="100" value="0">% buffered</progress><span role="tooltip" class="plyr__tooltip">00:00</span></div>',

// TODO: Fix this. Documentation will follow: https://github.com/sampotts/plyr/issues/812

'<!--<button type="button" class="plyr__control" aria-pressed="false" aria-label="Enable captions" data-plyr="captions"><svg class="icon--pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-captions-on"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-captions-off"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Disable captions</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Enable captions</span></button><div class="plyr__menu"><button id="plyr-settings-toggle-{id}" aria-haspopup="true" aria-controls="plyr-settings-{id}" aria-expanded="false" type="button" class="plyr__control" data-plyr="settings"><svg role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-settings"></use></svg><span class="plyr__tooltip" role="tooltip">Settings</span></button><form class="plyr__menu__container" id="plyr-settings-{id}" aria-hidden="true" aria-labelled-by="plyr-settings-toggle-{id}" role="tablist" tabindex="-1"><div><div id="plyr-settings-{id}-home" aria-hidden="false" aria-labelled-by="plyr-settings-toggle-{id}" role="tabpanel"><ul role="tablist"><li role="tab" hidden=""><button data-plyr="settings" type="button" class="plyr__control plyr__control--forward" id="plyr-settings-{id}-captions-tab" aria-haspopup="true" aria-controls="plyr-settings-{id}-captions" aria-expanded="false">Captions<span class="plyr__menu__value">None</span></button></li><li role="tab"><button data-plyr="settings" type="button" class="plyr__control plyr__control--forward" id="plyr-settings-{id}-quality-tab" aria-haspopup="true" aria-controls="plyr-settings-{id}-quality" aria-expanded="false">Quality<span class="plyr__menu__value">480P</span></button></li><li role="tab"><button data-plyr="settings" type="button" class="plyr__control plyr__control--forward" id="plyr-settings-{id}-speed-tab" aria-haspopup="true" aria-controls="plyr-settings-{id}-speed" aria-expanded="false">Speed<span class="plyr__menu__value">Normal</span></button></li></ul></div><div id="plyr-settings-{id}-captions" aria-hidden="true" aria-labelled-by="plyr-settings-{id}-captions-tab" role="tabpanel" tabindex="-1" hidden=""><button type="button" class="plyr__control plyr__control--back" aria-haspopup="true" aria-controls="plyr-settings-{id}-home" aria-expanded="false">Captions</button><ul></ul></div><div id="plyr-settings-{id}-quality" aria-hidden="true" aria-labelled-by="plyr-settings-{id}-quality-tab" role="tabpanel" tabindex="-1"><button type="button" class="plyr__control plyr__control--back" aria-haspopup="true" aria-controls="plyr-settings-{id}-home" aria-expanded="false">Quality</button><ul><li><label class="plyr__control"><input data-plyr="quality" name="plyr-quality" value="hd1080" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>1080P<span class="plyr__menu__value"><span class="plyr__badge">HD</span></span></label></li><li><label class="plyr__control"><input data-plyr="quality" name="plyr-quality" value="hd720" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>720P<span class="plyr__menu__value"><span class="plyr__badge">HD</span></span></label></li><li><label class="plyr__control"><input data-plyr="quality" name="plyr-quality" value="large" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>480P</label></li><li><label class="plyr__control"><input data-plyr="quality" name="plyr-quality" value="medium" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>360P</label></li><li><label class="plyr__control"><input data-plyr="quality" name="plyr-quality" value="small" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>240P</label></li><li><label class="plyr__control"><input data-plyr="quality" name="plyr-quality" value="tiny" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>Tiny</label></li></ul></div><div id="plyr-settings-{id}-speed" aria-hidden="true" aria-labelled-by="plyr-settings-{id}-speed-tab" role="tabpanel" tabindex="-1"><button type="button" class="plyr__control plyr__control--back" aria-haspopup="true" aria-controls="plyr-settings-{id}-home" aria-expanded="false">Speed</button><ul><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="0.5" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>0.5×</label></li><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="0.75" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>0.75×</label></li><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="1" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>Normal</label></li><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="1.25" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>1.25×</label></li><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="1.5" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>1.5×</label></li><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="1.75" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>1.75×</label></li><li><label class="plyr__control"><input data-plyr="speed" name="plyr-speed" value="2" checked="false" class="plyr__sr-only" type="radio"><span aria-hidden="true"></span>2×</label></li></ul></div></div></form></div>-->',


"<button type='button' class='playComplete plyr__control' data-plyr='forward' aria-label='",
    i18n_videohandler_completesnippet,
    "'>",
    "<span class='fas fa-plus-square'></span>",
    "<span class='label plyr__tooltip' role='tooltip'>",
    i18n_videohandler_completesnippet,
    "</span>",
"</button>",


"<button type='button' class='plyr__control playMix' data-plyr='forward' aria-label='",
    i18n_videohandler_mix,
    "'>",
    "<span class='fas fa-random'></span>",
    "<span class='label plyr__tooltip' role='tooltip'>",
    i18n_videohandler_mix,
    "</span>",
"</button>",


"<button type='button' class='plyr__control searchLyrics' data-plyr='forward' aria-label='",
    i18n_videohandler_lyrics,
    "'>",
    "<span class='fas fa-file-alt'></span>",
    "<span class='label plyr__tooltip' role='tooltip'>",
    i18n_videohandler_lyrics,
    "</span>",
"</button>",

'<button type="button" class="plyr__control" aria-pressed="false" aria-label="Enter fullscreen" data-plyr="fullscreen"><svg class="icon--pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-exit-fullscreen"></use></svg><svg class="icon--not-pressed" role="presentation"><use xlink:href="/static/img/plyr/3/plyr.svg#plyr-enter-fullscreen"></use></svg><span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span><span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span></button>',
"</div>"].join("");

var optionsPlyr2 = {
    debug: false,
    autoplay: autoplayPlyr,
    iconUrl: '/static/img/plyr/plyr.svg',
    blankUrl: '/static/blank.mp4',
    html: controlsPlyr2,
    tooltips: { controls: true, seek: true },

    // "keyboardShorcuts" is a typo of Plyr 2, this will be fixed in Plyr 3
    // https://github.com/sampotts/plyr/issues/572#issuecomment-342144587
    keyboardShorcuts: { focused: false, global: false }
};

var optionsPlyr3 = {
    autoplay: autoplayPlyr,
    blankUrl: '/static/blank.mp4',
    debug: false,
    iconUrl: '/static/img/plyr/3/plyr.svg',
    keyboard: { global: false, focused: false },
    tooltips: { controls: true },
    captions: { active: false },
    controls: controlsPlyr3,
    // Unsupported value of 'large' for quality
    quality: { default: 'default', options: ['hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny', 'default'] }
};

// Plyr 2
if(plyrVersion == 2) var video = plyr.setup('.plyr', optionsPlyr2);

// Plyr 3
if(plyrVersion == 3) {
    var video = new Plyr('.plyr', optionsPlyr3);
    video[0] = video;
}

var elementMessage = document.getElementsByClassName("message")[0];
var elementPlayPause = document.getElementsByClassName("playPause")[0];
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

    elementMessage.innerHTML = '<i class="fas fa-exclamation-triangle"></i>' + " " + message;
    elementMessage.style.visibility = "visible";
    elementMessage.style.opacity = "1";
    if(seconds > 0) setInterval(toggleMessage, seconds * 1000);
}

var playPause = function() {
    video[0].togglePlay();

    // Plyr 2
    if(plyrVersion == 2) var videoPaused = video[0].isPaused();

    // Plyr 3
    if(plyrVersion == 3) var videoPaused = video[0].paused;

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
    
    // Plyr 2
    if(plyrVersion == 2) video[0].seek(0);

    // Plyr 3
    if(plyrVersion == 3) video[0].currentTime = 0;

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
    // temporary variable for Plyr 2/3 switch
    var index;

    var firstCountdown = document.getElementsByClassName("countdown");
    if(firstCountdown.length > 1) firstCountdown[1].classList.toggle("countdown");

    var title = snippets[i].getElementsByClassName("name")[0].innerText;

    var countdown = document.createElement("div");
    countdown.classList.add("countdown");

    snippets[i].insertBefore(countdown, snippets[i].getElementsByTagName("p")[0]);

    document.getElementById("title").innerHTML = title;
    document.getElementsByTagName("title")[0].innerHTML = title + " - " + document.getElementById("snippets").dataset.playlisttitle + " - newsic";

    // Plyr 2
    if(plyrVersion == 2) index = 1;

    // Plyr 3
    if(plyrVersion == 3) index = 0;

    document.getElementsByClassName("searchLyrics")[index].href = "https://genius.com/search?q=" + title.replace(/\s+/g, '+');
    document.getElementsByClassName("playMix")[index].href = "/" + snippets[i].dataset.type + "/mix/" + snippets[i].dataset.id;
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
    // omits playing video before setting offset time
    video[0].pause();
    complete = false;

    // TODO: could be put into an array, then onclick bindings could be solved by foreach
    playPreviousElements = document.getElementsByClassName("playPrevious");
    playNextElements = document.getElementsByClassName("playNext");
    playCompleteElements = document.getElementsByClassName("playComplete");
    playMixElements = document.getElementsByClassName("playMix");
    searchLyricsElements = document.getElementsByClassName("searchLyrics");

    for (var temp = 0; temp <= 1; temp++) {
        playPreviousElements[temp].onclick = playPrevious;
        playNextElements[temp].onclick = playNext;
        playCompleteElements[temp].onclick = playComplete;
        playMixElements[temp].onclick = playMix;
        searchLyricsElements[temp].onclick = searchLyrics;
    }

    document.getElementsByClassName("playPause")[0].onclick = playPause;

    if(snippets[i].dataset.type === "vimeo") ready = true;

    if(snippets[i].dataset.type === "youtube") {

        // Plyr 2
        if(plyrVersion == 2) video[0].seek(parseFloat(snippets[i].getAttribute("data-start")));

        // Plyr 3
        if(plyrVersion == 3) {
            video.currentTime = parseFloat(snippets[i].getAttribute("data-start"));
        }

        debugMessage("Jumped to start time.");
        debugMessage(snippets[i].dataset.id + " " +  snippets[i].dataset.start + " " + snippets[i].dataset.end);

        // handle newsic's autoplay setting (affects first snippet only)
        if(!autoplayFirstVideo && !location.hash && i === 0 && prevOrNext != "prev") {
            video[0].pause();
        } else video[0].play();
    }
});


video[0].on("playing", function() {

    while (elementPlayPause.firstChild) {
        elementPlayPause.removeChild(elementPlayPause.firstChild);
    }
    newElement = document.createElement("i");
    newElement.classList = "fas fa-pause";
    elementPlayPause.appendChild(newElement);

    if(snippets[i].dataset.type === "vimeo" && ready) {

        // Plyr 2
        if(plyrVersion == 2) video[0].seek(parseFloat(snippets[i].dataset.start));

        // Plyr 3
        if(plyrVersion == 3) {
            video[0].currentTime = parseFloat(snippets[i].dataset.start);
        }

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
    var title = snippets[i].getElementsByClassName("name")[0].innerText;
    if(snippets[i].dataset.type == "youtube") {
        debugMessage("Error: " + error["detail"]["code"]);

        // see https://developers.google.com/youtube/iframe_api_reference?hl=de#Events
        if(error["detail"]["code"] == 150 || error["detail"]["code"] == 101) {
            showMessage(title + ": " + i18n_videohandler_embeddingforbidden);
        } else showMessage(title + ": " + i18n_videohandler_blocked);
    } else showMessage(title + ": " + i18n_videohandler_skipped);
    if(prevOrNext == "prev") playPrevious();
    else playNext();
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

        // Plyr 2
        if(plyrVersion == 2) var videoCurrentTime = video[0].getCurrentTime();

        // Plyr 3
        if(plyrVersion == 3) var videoCurrentTime = video[0].currentTime;

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

// whole bunch of handy keyboard shortcuts (inspired by several popular video content provider *cough*)
document.addEventListener("keydown", function(e) {

    // stop triggering input fields
    if (e.target.nodeName.toLowerCase() !== "input" && !e.ctrlKey && !e.altKey && !e.shiftKey) {

        switch (e.key) {
            // "f": toggle fullscreen
            case "f":
                if(plyrVersion == 2) video[0].toggleFullscreen();
                if(plyrVersion == 3) video[0].fullscreen.toggle();
                break;

            // "l": search for lyrics
            case "l":
                searchLyrics();
                break;

            // "m": mute player
            case "m":
                if(plyrVersion == 2) video[0].toggleMute();
                if(plyrVersion == 3) {
                    if (video[0].muted) video[0].muted = false;
                    else video[0].muted = true;
                }
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