# newsic

*Hey there, this is an early version of newsic, which might catch fire quite often. You're very welcome to open an [issue](https://github.com/newsic/newsic/issues) for bugs you found, improvements or new ideas :)*

Got YouTube playlists with 100+ songs and a thirst for exploring something new? With newsic you can automatically listen to small 30-second-snippets and hear full songs if you'd like to jump into the tune.

## Project page & demo

[Project page: newsic.tocsin.de](https://newsic.tocsin.de)

[Demo: trynewsic.tocsin.de](https://trynewsic.tocsin.de)

## How newsic looks like

![How newsic looks like.](https://newsic.tocsin.de/stc/github/demo_2016-10-02.png)

## System requirements

newsic's backend is based on Python 3 and the [Flask](https://github.com/pallets/flask) framework, while the frontend uses [Video.js](https://github.com/videojs/video.js) (which comes bundled with this repository).

Flask (and Jinja2 and Werkzeug) can either be installed with your favorite package manager or with `pip install -r requirements.txt`

## Usage

1. Clone this repository.
2. Rename config.py.example to config.py.
2. Add your YouTube API key (which you can request
   [here](https://console.developers.google.com/apis/api/youtube/)) to config.py.
3. Navigate to the folder where you cloned the code and start newsic with `python newsic.py`.
4. newsic is now available at 127.0.0.1:5000.

### Deployment

For running newsic on shared hosting provider you would like to use a deployment script.
There are many [different options for running Flask on a server](http://flask.pocoo.org/docs/dev/deploying/).

The code running at [trynewsic.tocsin.de](https://trynewsic.tocsin.de) (hosted proudly on Uberspace.de) is released at [newsic/deployment](https://github.com/newsic/deployment).

### Shortcuts

Shortcut | What will happen (hopefully)
------------ | -------------
`k` or `Space bar` | Play/Pause
`a` or `←` | Previous song
`d` or `→` | Next song
`c` | Play complete song
`f` | Toggle fullscreen


## License

MIT License, Copyright (c) 2015-2016 Stephan Fischer ([tocsin.de](https://tocsin.de), [stephan-fischer.de](https://stephan-fischer.de))

For more details see [LICENSE.md](/LICENSE.md).
