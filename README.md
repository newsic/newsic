# newsic

*Hey there, this is an early version of newsic, which might catch fire quite often. You're very welcome to open an [issue](https://github.com/newsic/newsic/issues) for bugs you found, improvements or new ideas :)*

Got YouTube playlists with 100+ songs and a thirst for exploring something new? With newsic you can automatically listen to small 30-second-snippets and hear full songs if you'd like to jump into the tune.

## Project page & demo

[Project page: newsic.tocsin.de](https://newsic.tocsin.de)

[Demo: trynewsic.tocsin.de](https://trynewsic.tocsin.de)

## How newsic looks like

![How newsic looks like.](https://newsic.tocsin.de/stc/github/demo_2016-10-02.png)

## System requirements

newsic's backend is based on Python 3 and the [Flask](https://github.com/pallets/flask) framework, while the frontend uses [Video.js](https://github.com/videojs/video.js) (which comes bundled with this repository). Required Python packages are listed in the [requirements.txt](/requirements.txt).

## Usage

1. Clone this repository and navigate to the folder where you cloned it to
2. Create a config.py from config.py.example
3. Add your YouTube API key (which you can request
   [here](https://console.developers.google.com/apis/api/youtube/)) to config.py
4. Install the requirements with either `pip install -r requirements.txt` or your favorite package manager
5. Start newsic with `python3 newsic.py` (or only `python newsic.py` when you use Arch Linux), which is now available at 127.0.0.1:5000

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

MIT License, Copyright (c) 2015-2017 Stephan Fischer ([tocsin.de](https://tocsin.de), [stephan-fischer.de](https://stephan-fischer.de))

For more details see [LICENSE](/LICENSE).

## Used scripts

* [Flask](https://github.com/pallets/flask) (Armin Ronacher and contributors, BSD License)
* [Video.js](https://github.com/videojs/video.js) (Brightcove Inc, Apache License 2.0)
* [videojs-youtube](https://github.com/videojs/videojs-youtube) (Benoit Tremblay, MIT License)
* [videojs-vimeo](https://github.com/videojs/videojs-vimeo) (Benoit Tremblay, MIT License)

## Donate

If you think newsic might be worth a small donation: [Sure, go ahead :)](https://www.paypal.me/tocsin/5eur) 
Let me be clear that earning money wasn't the motivation behind all this. I appreciate your code contributions, pull requests or bug reports just equally :)
