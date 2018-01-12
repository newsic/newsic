# 0.3: OML
## Release: 2018

### New Features

* Mix function: finds new playlist based on current video or video url input
* Autocomplete for input form (beta, YouTube only)
* Improved Vimeo support (now in beta status)
* Custom URL feature (working title) makes it possible to use cross-provider playlists (in combination with in-dev playlist creator for project page)
* Link to lyrics search (very basic; powered by Genius)
* Added support for caching, compressing and minification (installable via requirements-performance.txt)
* German and French translations

### Layout/Design/UI

* Added countdown bar to current selected snippet
* Simplified logo and favicon (ditched the shadow)
* Bye, "float": More and more Flexbox used
* So sassy: CSS code generated via SCSS files
* Using box-shadow instead of self-invented concept
* Less cluttered snippet info
* Increased width for start page (for bigger screens)
* Improved structure of header
* Linux: Input fields keep background color on dark GTK themes
* Moved control buttons into snippet info

### UX

* Introducing more keyboard shortcuts: "S" for play/pause, "X" for mix, "M" for mute, "L" for lyric search
* Using same opacity changes on hovering for all elements (buttons, thumbs etc.)
* Increased font weight and font sizes (especially for smaller device widths) with consequent usage of "vw"

### Server/Deployment

* Improved subfolder deployment
* Began to implement CLI functions ("flask flushcache")
* Config file: Example local and server config now extend general config
* Support for environment variables with python-dotenv (optional)

### For developers

* From now on all CSS and JavaScript files are minified (human readable versions still available)
* .editorconfig file
* JavaScript: put console.log messages in toggable debug function

### Et cetera

* Plyr 2.0.18 (while preparing support for upcoming Plyr 3)
* FontAwesome 5.0.2
* Added playlist title to page title
* New calculation of snippet start time (currently testing, not in use yet)
* Switching to official Vimeo library ("PyVimeo" instead of "Vimeo")
* Improved YouTube regex
* Improved code layout: PEP-8 in every Python file (spaces instead of tabs, trimming lines, more and better function docs)
* Updated README and introduced CHANGES.md file
* Bundled FontAwesome and Plyr files into repository
* Shorter route URLs
* Eastereggs (part I)
* Completely removed GeoIP check and instead improved error handling
    * tests needed, country check might come back eventually
* Renamed and reorganized files
* Source code of HTML templates shows elapsed time for non-cached page requests
* Browser: moved to KeyboardEvent.key
* Seperate SCSS files (home page, responsive layout)
* Included humans.txt
* More Open Graph and Twitter card meta tags

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