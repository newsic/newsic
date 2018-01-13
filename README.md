# newsic

*You're very welcome to open an [issue](https://github.com/newsic/newsic/issues) for bugs you found, improvements or new ideas :)*

Got YouTube or Vimeo playlists with way too many songs and a thirst for exploring something new? With newsic you can listen to small 30-second song snippets (or the whole song) and discover other playlists easily.

## Project page & demo

[Project page: newsic.tocsin.de](https://newsic.tocsin.de)

[Demo: trynewsic.tocsin.de](https://trynewsic.tocsin.de)

## How newsic looks like

![How newsic looks like.](https://newsic.tocsin.de/pr/demo%202018-01-13.jpg)

## System requirements

newsic's backend is based on Python 3 and the [Flask](https://github.com/pallets/flask) framework, while the frontend uses [Plyr](https://github.com/sampotts/plyr) (which comes bundled with this repository). Required Python packages are listed in the [requirements.txt](/requirements.txt).

## Usage

1. Clone this repository: `git clone https://github.com/newsic/newsic.git`
2. Create a config.py from config.py.example
3. Add your API keys ([YouTube](https://developers.google.com/youtube/v3/getting-started), [Vimeo](https://developer.vimeo.com/api)) to config.py
4. Install the minimal requirements with `pip install -r requirements.txt`; you might wanna use a virtual environment for that
5. Start newsic with `python3 newsic.py`, which is now available at [127.0.0.1:5000](http://127.0.0.1:5000)

### Performance and caching

Starting with version 0.3 newsic offers optional support for caching, compressing and minifying - based on [Flask Caching](https://github.com/sh4nks/flask-caching), [Flask-Compress](https://github.com/libwilliam/flask-compress) and [Flask-HTMLmin](https://github.com/hamidfzm/Flask-HTMLmin). The packages are installable with `pip install -r requirements-performance.txt`. See [config.py.example](/config.py.example) for all available options and module documentation.

### Deployment

For running newsic on your server (or a shared hosting provider) you would like to use a deployment script.
There are many [different options for running Flask on a server](http://flask.pocoo.org/docs/dev/deploying/).

As an example have a look at the FCGI script powering [the newsic demo](https://trynewsic.tocsin.de) (hosted proudly on [Uberspace](https://uberspace.de)) in the [deployment](https://github.com/newsic/deployment) repository.

### Shortcuts

Shortcut | What it does
-|-
`A` or `←` | Previous song
`D` or `→` | Next song
`S`, `K` or `Space bar` | Toggle play/pause
`C` | Play complete song
`F` | Toggle fullscreen
`M` | Toggle mute
`X` | Start mix based on current song
`L` | Search for lyrics on [Genius](https://genius.com)
`E` | Focus search field


## License

MIT License, Copyright (c) 2015-2018 Stephan Fischer (@tocsinDE, [stephan-fischer.de](https://stephan-fischer.de), [tocsin.de](https://tocsin.de))

For more details see [LICENSE](/LICENSE).

## Dependencies

### Core
* [Flask](https://github.com/pallets/flask): Armin Ronacher (@mitsuhiko) and contributors, BSD License (3-clause)
* [Flask-Babel](https://github.com/python-babel/flask-babel): Python-Babel team (https://github.com/python-babel), BSD License (3-clause)
* [Plyr](https://github.com/sampotts/plyr): Sam Potts (@sampotts), MIT License
* [PyVimeo](https://github.com/vimeo/vimeo.py): Vimeo (@vimeo), Apache License 2.0

### Optional
* [Flask Caching](https://github.com/sh4nks/flask-caching): Peter Justin (@sh4nks), BSD License (3-clause)
* [Flask-Compress](https://github.com/libwilliam/flask-compress): William Fagan (@libwilliam), MIT License
* [Flask-HTMLmin](https://github.com/hamidfzm/Flask-HTMLmin): Hamid FzM (@hamidfzm), BSD License (3-clause)
* [python-dotenv](https://github.com/theskumar/python-dotenv): Saurabh Kumar (@theskumar), BSD License (3-clause)

## Donate

If you think newsic is worth a small donation: [Thank you very much :)](https://www.paypal.me/tocsin/5eur) 
Let me be clear that earning money wasn't the motivation behind all this. I'll appreciate your code contributions, pull requests or bug reports just equally :)