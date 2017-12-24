# 0.3: OML
## Release: 2018

(TODO: restructuring)

### Features

### Frontend

#### Design
#### UI
#### UX

### Backend

### Etc

### Features:
* Added support for caching, compressing and minification (installable via requirements-performance.txt)
* Mix function: finds new playlist based on current video or video url input
* Autocomplete for input form (beta, YouTube only)
* Improved Vimeo support (now in beta status)
* Custom URL feature (working title) makes it possible to use cross-provider playlists (in combination with in-dev playlist creator for project page)

### Layout/Design:
* Added countdown bar to current selected snippet
* Simplified logo and favicon (ditched the shadow)
* Bye, "float": More and more Flexbox used
* So sassy: CSS code generated via SCSS files
* Using box-shadow instead of self-invented concept
* Using same opacity changes on hovering for all elements (buttons, thumbs etc.)
* Less cluttered snippet info
* Increased width for start page (for bigger screens)
* Improved structure of header
* Increased font weight and font sizes (especially for smaller device widths) with consequent usage of "vw"

### Et cetera:
* Plyr 2.0.17 (while preparing support for upcoming Plyr 3)
* Improved subfolder deployment
* Added playlist title to page title
* New calculation of snippet start time (currently testing, not in use yet)
* From now on all CSS and JavaScript files are minified (human readable versions still available)
* Introducing more keyboard shortcuts: "s" for play/pause, "x" for mix, "m" for mute, "l" for lyric search
* Switching to official Vimeo library ("PyVimeo" instead of "Vimeo")
* Better YouTube regex
* Improved code design: PEP-8 in every Python file (spaces instead of tabs, trimming lines, more and better function docs)
* Config file: Example local and server config now extend general config
* Updated README and introduced CHANGES.md file
* Bundled FontAwesome and Plyr files into repository
* Shorter route URLs
* Eastereggs (part I)
* Link to lyrics search (very basic; powered by Genius)
* Completely removed GeoIP check and instead improved error handling
    * tests needed, country check might come back eventually
* JavaScript: put console.log messages in toggable debug function
* Renamed and reorganized files
* Source code of HTML templates shows elapsed time for non-cached page requests
* Put control buttons into snippet info
* Began to implement CLI functions (flask flushcache)
* Linux: Input fields keep background color on dark GTK themes
* Browser: moved to KeyboardEvent.key
* .editorconfig file
* seperate SCSS files (home page, responsive layout)


# 0.2: Fire
## Release: 2017-03-06

* Ciao VideoJS, welcome to the party Plyr (offers built-in support for YouTube and Vimeo, plugins are now a thing of the past)!
* First time with Vimeo support (alpha status, not really useable yet) for both albums and channels
* Improved start page, thumbnail presentation (now made with Flexbox) and more design tweaks
* Youtube playlists with day-long videos don't break newsic any longer :)
* Better analysis of playlist status (private/embeddable etc.)
* Updated readme file



# 0.1: T=0
## Release: 2017-02-15

First pre-release.