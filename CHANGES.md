# 0.3: OML
## Release: 2018-02-01

### New features

* Mix function: finds new playlist based on current video or video url input
* Autocomplete (beta, YouTube only)
* Improved Vimeo support (now in beta status)
* Custom playlists (beta): support for cross-provider playlists (in combination with soon to be released playlist creator)
* Added support for caching, compressing and minification (installable via requirements-performance.txt)
* German and French translations for most parts of frontend
* Link to lyric search (very basic; powered by Genius)

### Layout/Design/UI

* Simplified logo and favicon (ditched the shadow)
* Bye, "float": More and more Flexbox used
* So sassy: CSS code generated via SCSS files
* Using box-shadow instead of self-invented concept
* Less cluttered snippet info
* Increased width for start page (for bigger screens)
* Improved structure of header
* Linux: Input fields keep background color on dark GTK themes
* Moved control buttons into snippet info
* Increased font weight and made font sizes dynamic
* More dynamic margins and paddings ("vw" instead of "px")

### UX

* Added countdown bar to currently selected snippet
* Introducing more keyboard shortcuts: "S" for play/pause, "X" for mix, "M" for mute, "L" for lyric search
* Using same opacity changes on hovering for all elements (buttons, thumbs etc.)
* Rearranged order of Plyr controls
* Added newsic buttons and Raleway as standard font for Plyr

### Server/Deployment

* Improved subfolder deployment
* Began to implement CLI functions ("flask flushcache")
* Config file: Example local and server config now extend general config
* Support for environment variables with python-dotenv (optional)

### For developers

* From now on all CSS and JavaScript files are minified (human readable versions still available)
* .editorconfig file
* JavaScript: put console.log messages in toggable debug function
* Included Plyr 3 files (videohandler.js contains version switch)

### Et cetera

* Update to Plyr 2.0.18 (while preparing support for upcoming Plyr 3)
* Update to FontAwesome 5.0.2 (SVG and JavaScript instead of old approach with font files)
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
* Browser/JavaScript: moved to KeyboardEvent.key
* Seperate SCSS files (home page, responsive layout)
* Included humans.txt
* More Open Graph and Twitter card meta tags
* JavaScript and HTML: Began on replacing tabs with spaces
* Basic Progressive Web App support

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