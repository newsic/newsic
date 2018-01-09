"""
newsic main file for Flask
"""

import re
from random import randrange
from urllib import request as urllib_request
from urllib.parse import quote
from json import loads, dumps
from time import perf_counter as time_perf_counter

# python-dotenv
from os.path import join, dirname
from os import getenv

try:
    from dotenv import load_dotenv
except ImportError:
    pass

from click import echo as click_echo

# flask
from flask import Flask, render_template, request, redirect, url_for, g as flask_g
from flask_babel import Babel, gettext

try:
    from vimeo import VimeoClient
except ImportError:
    print("Warning: Vimeo libary is missing")

try:
    from flask_caching import Cache
    from flask_compress import Compress
    from flask_htmlmin import HTMLMIN
except ImportError:
    pass

app = Flask(__name__)
babel = Babel(app)

# Config management

# default: False
CONFIG_DOTENV = False

def read_config(value):

    """
    Import config from config.py
    Settings can be overwritten by .env file
    """

    if CONFIG_DOTENV:
        # it's your task to implement environment variables
        # newsic recommends using python-dotenv
        # have a look at  https://github.com/newsic/deployment for a manual

        # python-dotenv
        dotenv_path = join(dirname(__file__), '.env')
        load_dotenv(dotenv_path)

    if CONFIG_DOTENV and getenv(value):
        return getenv(value)

    else:
        # fetch config values from config.py
        # use class "local" from config.py
        app.config.from_object("config.Local")
        #app.config.from_object("config.Server")

        return app.config[value]


@app.before_request
def before_request():

    """
    Calculates runtime
    """

    flask_g.starttime = time_perf_counter()
    flask_g.runtime = lambda: "%.5fs" % (time_perf_counter() - flask_g.starttime)


def debug(text):

    """
    Delivers output on debug mode (see config file) only
    """
    
    #TODO: think about deprecating "NEWSICDEBUG" and only use "DEBUG"
    if read_config("NEWSICDEBUG"):
        app.logger.debug(text)

if read_config("CACHE"):
    debug("Cache activated")
    CACHE = Cache(app, config={'CACHE_TYPE': read_config("CACHE_TYPE"),
                               'CACHE_DIR': read_config("CACHE_DIR")})

if read_config("COMPRESS"):
    debug("Compression activated")
    Compress(app)

if read_config("MINIFY_PAGE"):
    debug("Minify activated")
    HTMLMIN(app, remove_comments=read_config("REMOVE_COMMENTS"),
            reduce_empty_attributes=read_config("REDUCE_EMPTY_ATTRIBUTES"),
            remove_optional_attribute_quotes=read_config("REMOVE_OPTIONAL_ATTRIBUTE_QUOTES")
           )

if read_config("CACHE_MAX_AGE"):
    @app.after_request
    def add_header(response):

        """
        Append custom response header after finishing a request
        """

        response.cache_control.max_age = read_config("CACHE_MAX_AGE")
        return response

def cache():

    """
    Toggles caching based on setting in config.py
    """

    if read_config("CACHE"):
        return CACHE.cached(timeout=read_config("CACHE_TIMEOUT"))
    return lambda x: x


@app.cli.command()
def flushcache():

    """
    CLI: Delete all cached data (if cache is activated)

    Usage: "flask flushcache"
    """

    if read_config("CACHE"):
        click_echo("Cache successfully flushed")
        CACHE.clear()
    else:
        click_echo("Cache inactive, unable to flush")


def snippet_start_at(length):

    """
    Calculates snippet start time

    Still experimenting. Previously started at half video length
    (which matched the refrain pretty good most times)
    """

    if length > int(read_config("SNIPPETLENGTH")):
        if length < int(read_config("SNIPPETLENGTH")) * 2:
            return (length - int(read_config("SNIPPETLENGTH"))) / 2

        # new approach:
        # return (length / 2) - (read_config("SNIPPETLENGTH") / 2)

        # old approach:
        return length / 2

    if length <= int(read_config("SNIPPETLENGTH")):
        return 0


# TODO: rename yt_general_playlist_info
def yt_general_playlist_info(playlist_id):

    """
    Fetch general information about the playlist (defined by given playlist_id)
    """

    request_data = (
        #TODO: use fields for filtering the results
        "{}/playlists?part=snippet,status&id={}"
        + "&fields=items&key={}").format(
            YOUTUBE_API_URL, playlist_id, read_config("YOUTUBE_API_KEY"))
    data_response = loads(urllib_request.urlopen(request_data).read().decode())

    if data_response["items"]:
        return data_response["items"][0]["snippet"]

    # playlist is either private or empty
    return False

# TODO: rename yt_grab
# TODO: remove "dangerous default value [] for video_ids as argument"
# TODO: split in two functions:
# first fetches video ids of a playlist -> store in list
# second takes the list of first one and requests more information
def yt_grab(video_ids=[], playlist_id=None):

    """
    Fetch video info from YouTube based on a list of video IDs or a single playlist ID
    """

    # * big function
    # * two cases
    #   * 1: we don't have video ids: use a playlist id, grab ids and put em in a list
    #   * 2: we already have video ids (in a list), so use them
    # * fetch first 50 video ids in a batch
    # * fetch the rest
    # * return video_list with id, type, title, start, end, length, blocked, allowed

    max_results = 50 # YouTube API has a limit per request (50 videos in one batch is maximum)

    if not video_ids:

        video_ids = []
        request_iteration = 1
        next_page_token = ""

        # fetch video ids from playlist
        while True:
            #TODO: use fields for filtering the results
            request_video_ids = (
                "{}/playlistItems?part=contentDetails&playlistId={}"
                + "&fields=items%2FcontentDetails%2CnextPageToken%2CpageInfo"
                + "&key={}&maxResults={}&pageToken={}").format(
                    YOUTUBE_API_URL, playlist_id, read_config("YOUTUBE_API_KEY"),
                    max_results, next_page_token)

            receive_video_ids = urllib_request.urlopen(request_video_ids)
            json_video_ids = loads(receive_video_ids.read().decode())

            for items in json_video_ids["items"]:
                video_ids.append(items["contentDetails"]["videoId"])

            if "nextPageToken" not in json_video_ids:
                break

            next_page_token = json_video_ids["nextPageToken"]
            request_iteration = request_iteration + 1

    else:
        #TODO: check if code is correct (assumption: it is not)
        request_iteration = len(video_ids) % max_results
        #debug(request_iteration)


    range_start = 0
    range_end = max_results
    video_list = []
    
    while request_iteration > 0:
        video_ids_part = ','.join(video_ids[range_start:range_end])
        #TODO: use fields for filtering the results
        url = ("{}/videos?part=contentDetails,snippet,status&id={}&key={}").format(
            YOUTUBE_API_URL, video_ids_part, read_config("YOUTUBE_API_KEY"))
        response = urllib_request.urlopen(url)
        data = loads(response.read().decode())

        # fetch more details for every video
        for video in data["items"]:
            if data["items"]:
                embeddable = video["status"]["embeddable"]
                privacy_status = video["status"]["privacyStatus"]
                privacy_public = privacy_status == "public"
                privacy_unlisted = privacy_status == "unlisted"
                upload_status = video["status"]["uploadStatus"]
                upload_processed = upload_status == "processed"
                debug((
                    "\n{} (ID: {}) \nprivacy: {} | "
                    + "upload status: {} | embed status: {} ").format(
                        video["snippet"]["title"], video["id"],
                        privacy_status, upload_status, embeddable))

                if (embeddable and upload_processed and
                        (privacy_public or privacy_unlisted)):
                    blocked = []
                    allowed = []

                    # find region restrictions (allowed or blocked)
                    if "regionRestriction" in video["contentDetails"]:
                        region_restriction = video["contentDetails"]["regionRestriction"]

                        if "blocked" in region_restriction:
                            for country in region_restriction["blocked"]:
                                blocked.append(country)
                            debug(("Blocked in these countries: {}").format(str(blocked)))

                        if "allowed" in region_restriction:
                            for country in region_restriction["allowed"]:
                                allowed.append(country)
                            debug(("Only allowed in these countries: {}").format(str(allowed)))

                    # convert YouTube's time format to hours, minutes and seconds
                    days = hours = minutes = seconds = 0

                    length_string = re.compile(
                        r"P(?P<d>\d*D)*T(?P<h>\d*H)*(?P<m>\d*M)*(?P<s>\d*S)*")
                    length = length_string.match(video["contentDetails"]["duration"])

                    if length.group("d"):
                        days = length.group("d").replace("D", "")

                    if length.group("h"):
                        hours = length.group("h").replace("H", "")

                    if length.group("m"):
                        minutes = length.group("m").replace("M", "")

                    if length.group("s"):
                        seconds = length.group("s").replace("S", "")

                    length_sec = (int(days) * 86400 + int(hours) * 60 * 60
                                  + int(minutes) * 60 + int(seconds))

                    #debug(("Length: {} seconds").format(length_sec))

                    start_time = snippet_start_at(length_sec)
                    end_time = start_time + int(read_config("SNIPPETLENGTH"))
                    if end_time > length_sec:
                        end_time = length_sec

                    # video_list = 0: id, 1: provider, 2: title, 3: start, 4: end, 5: length, 6: blocked, 7: allowed

                    video_list.append([
                        video["id"],
                        "youtube",
                        video["snippet"]["title"],
                        start_time,
                        end_time,
                        length_sec,
                        blocked,
                        allowed])
                else:
                    debug("Embedding is not allowed, therefore this video was skipped.")

        request_iteration = request_iteration - 1
        range_start = range_start + max_results
        range_end = range_end + max_results

    return video_list


@app.route("/")
@cache()
def index():

    """
    Rendering of home page
    """

    return render_template(
        "index.html",
        bodyClass="home",
        title=gettext(u"Home")
    )

"""
Constants
"""

YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3"
VIMEO = VimeoClient(
    token=read_config("VIMEO_TOKEN"),
    key=read_config("VIMEO_KEY"),
    secret=read_config("VIMEO_SECRET"))

@app.route("/", methods=["POST"])
def index_post():

    """
    Check whether given url is valid and from which video provider;
    invalid url redirects to home page
    """

    route = ""

    # Is it easter yet?

    if request.form["url"] == "rickroll":
        route = redirect(
            url_for(
                "play_youtube",
                youtube_playlist="PLdduFHK2eLvf6RE6a7l0jLNYFsYU_ALK7"))

    if request.form["url"] == "schwifty":
        route = redirect(
            url_for(
                "play_youtube",
                youtube_playlist="PLdduFHK2eLvdwarNDUhOyUO2dGW5sCguk"))

    if request.form["url"] == "versions":
        route = redirect(
            url_for(
                "play_youtube",
                youtube_playlist="PLdduFHK2eLve4U1BJmhU1PSKRp6WvgyRA"))

    youtube_video_regex = re.compile(
        r"(?:https?:\/\/)*(?:[a-z].*).?youtube.com\/watch\?v=([a-zA-Z0-9-_]*)?")
    youtube_playlist_regex = re.compile(
        r"(?:https?:\/\/)*(?:[a-z].*).?youtube.com\/.*list=([a-zA-Z0-9-_]*)(?:.*index=(\d*))?")    
    vimeo_regex = re.compile(
        r"(?:https?:\/\/)*(?:[a-z].*).?vimeo.com\/.*(album|channels)\/(\d*)")

    youtube_video = youtube_video_regex.match(request.form["url"])
    youtube_playlist = youtube_playlist_regex.match(request.form["url"])
    vimeo = vimeo_regex.match(request.form["url"])

    if youtube_video:
        debug(("Received a YouTube video: {}").format(youtube_video.group(1)))

        route = redirect(
            url_for(
                "mix_youtube",
                video_id=youtube_video.group(1)))

    if youtube_playlist:
        debug(("Received a YouTube playlist: {}").format(youtube_playlist.group(1)))

        route = redirect(
            url_for(
                "play_youtube",
                youtube_playlist=youtube_playlist.group(1)))

    if vimeo:
        debug(("Received a Vimeo {}: {}").format(vimeo.group(1), vimeo.group(2)))

        if (vimeo.group(1) == "channels"):
            vimeo_type = "channel"
        else:
            vimeo_type = vimeo.group(1)

        # TODO: strip "s" from "channels" (prefering singular in url scheme)

        route = redirect(
            url_for(
                "play_vimeo",
                vimeo_type=vimeo_type,
                vimeo_id=vimeo.group(2)))

    if route:
        return route

    # redirect to index page in case there's no valuable user input
    debug("No music found")

    return render_template(
        "index.html",
        error=gettext(u"No music found"),
        bodyClass="home",
        title=gettext(u"No music found"))

@app.route("/search", methods=["POST"])
def search():

    """
    Handling of POST requests for autocomplete.js
    """

    if request.method == "POST":
        debug(("Incoming POST request: {}").format(request.json["search"]))

        max_results = 5
        #TODO: use fields for filtering the results
        api_search_with_title = (
            "{}/search?q={}&type=playlist&part=id,snippet"
            + "&maxResults={}&key={}").format(
                YOUTUBE_API_URL, quote(request.json["search"]),
                max_results, read_config("YOUTUBE_API_KEY"))
        response_search = urllib_request.urlopen(api_search_with_title)
        data_search = loads(response_search.read().decode())

        result = []
        for playlist in data_search["items"]:

            #TODO: use fields for filtering the results

            req = (
                "{}/playlistItems?playlistId={}"
                + "&part=id&fields=pageInfo(totalResults)"
                + "&maxresults=1&key={}").format(
                    YOUTUBE_API_URL, playlist["id"]["playlistId"], read_config("YOUTUBE_API_KEY"))
            request_send = urllib_request.urlopen(req)
            videos_in_playlist = loads(request_send.read().decode())

            if "thumbnails" in playlist["snippet"]:
                thumbnail_url = playlist["snippet"]["thumbnails"]["medium"]["url"]

            #TODO: decide what to return in case of missing thumbnail
            else:
                thumbnail_url = ""

            result.append({
                "id": playlist["id"]["playlistId"],
                "title": playlist["snippet"]["title"],
                "thumb": thumbnail_url,
                "amount": videos_in_playlist["pageInfo"]["totalResults"]})
        return dumps(result)

@app.route("/custom/<path:path>")
# TODO: validate youtube and vimeo ids (or skip the wrong/private ones)
def custom_playlist(path):

    """
    Dynamic playlist handling

    """

    # TODO: make slash at end of string optional
    regex = re.findall(r"(vimeo|youtube)(?:\:)([a-zA-Z0-9-_]+)(?:\/)", path)

    message = ""

    if not regex:
        debug("No music found")

        return render_template(
            "index.html",
            error=gettext(u"No music found"),
            bodyClass="home",
            title=gettext(u"No music found"))

    youtube = [[i, x[1]] for i, x in enumerate(regex) if "youtube" in x]
    vimeo = [(i, x[1]) for i, x in enumerate(regex) if "vimeo" in x]

    video_list = []

    #TODO: logging
    
    if youtube:
        youtube_ids = []

        for video in youtube:
            youtube_ids.append(video[1])

        youtube_api_results = yt_grab(video_ids=youtube_ids)

        for position, video in enumerate(youtube_api_results):
            video_list.insert(youtube[position][0], video)

    if vimeo:
        vimeo_ids = []
        vimeo_api_results = []

        for video in vimeo:
            vimeo_ids.append("/" + video[1])

        message="custom-vimeo-beta"

        vids = VIMEO.get(('/videos?links={}').format(",".join(vimeo_ids)),
                     params={"fields": "name, pictures.uri, duration"})

        debug(vimeo_ids)
        debug(",".join(vimeo_ids))

        regex_ids = re.compile(r"\/videos\/(\d+)\/pictures\/(\d+)")
        debug(vids.json())

        #TODO: vimeo api results are in wrong order
        #TODO: outsource this function (like the youtube one)
        for data in vids.json()["data"]:
            ids = regex_ids.match(data["pictures"]["uri"])
            start_time = snippet_start_at(data["duration"])
            end_time = start_time + int(read_config("SNIPPETLENGTH"))
            if end_time > data["duration"]:
                end_time = data["duration"]

            # video_list = 0: id, 1: provider, 2: title, 3: start, 4: end, 5: length, 6: thumbnail id

            if ids:
                vimeo_api_results.append([
                    ids.group(1),
                    "vimeo",
                    data["name"],
                    start_time,
                    end_time,
                    data["duration"],
                    ids.group(2)])
        
        for position, video in enumerate(vimeo_api_results):
            video_list.insert(vimeo[position][0], video)

    debug(video_list)

    #TODO: find better words for playlist title and creator
    return render_template(
        "play.html",
        videolist=video_list,
        playlistTitle=gettext(u"Custom playlist"),
        playlistCreator=gettext(u"Anonymous"),
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + gettext(u"Custom playlist"),
        message=message,
        runtime=flask_g.runtime())

@app.route("/youtube/mix/<video_id>")
@cache()
def mix_youtube(video_id):

    """
    Fetch a playlist from YouTube based on a single video
    TODO: improve performance
    """

    #TODO: use fields for filtering the results

    api_get_video_title = (
        "{}/videos?id={}&part=snippet"
        + "&key={}").format(
            YOUTUBE_API_URL, video_id, read_config("YOUTUBE_API_KEY"))
    response_title = urllib_request.urlopen(api_get_video_title)
    data_title = loads(response_title.read().decode())

    if data_title["items"]:

        video_title = data_title["items"][0]["snippet"]["title"]
        video_title_nospaces = video_title.replace(" ", "+")

        max_results = 15

        #TODO: use fields for filtering the results
        api_search_with_title = (
            "{}/search?q={}&type=playlist&part=id"
            + "&maxResults={}&key={}").format(
                YOUTUBE_API_URL, quote(video_title_nospaces),
                max_results, read_config("YOUTUBE_API_KEY"))
        response_search = urllib_request.urlopen(api_search_with_title)
        data_search = loads(response_search.read().decode())

        if data_search["pageInfo"]["totalResults"] == 0:
            return render_template(
                "index.html",
                error=gettext(u"No mix available for this video"),
                bodyClass="home",
                title=gettext(u"No mix available"))

        randnum = randrange(max_results)

        if data_search["pageInfo"]["totalResults"] < max_results:
            randnum = randrange(data_search["pageInfo"]["totalResults"])

        return redirect(
            url_for(
                "play_youtube",
                youtube_playlist=data_search["items"][randnum]["id"]["playlistId"]))

    return render_template(
        "index.html",
        error=gettext(u"No mix available for this video"),
        bodyClass="home",
        title=gettext(u"No mix available"))

@app.route("/youtube/<youtube_playlist>")
@cache()
def play_youtube(youtube_playlist):

    """
    Fetch videos from YouTube
    """

    # fetch general information about the playlist
    # TODO: rename yt_general_playlist_info
    general_info = yt_general_playlist_info(youtube_playlist)

    if not general_info:
        return render_template(
            "index.html",
            error=gettext(u"This playlist is either empty, private or non-existing"),
            bodyClass="home",
            title=gettext(u"Invalid playlist"))

    # TODO: rename yt_grab
    video_list = yt_grab(playlist_id=youtube_playlist)

    debug(("\nRuntime: {}").format(flask_g.runtime()))
    return render_template(
        "play.html",
        videolist=video_list,
        playlistTitle=general_info["title"],
        playlistCreator=general_info["channelTitle"],
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + general_info["title"],
        runtime=flask_g.runtime())

# TODO: check url earlier (vimeo_type can only be either "channel" or "album")
@app.route("/vimeo/<string:vimeo_type>/<int:vimeo_id>")
@cache()
def play_vimeo(vimeo_type, vimeo_id):

    """
    Fetch videos from Vimeo
    """

    video_list = []

    if (vimeo_type != "album") and (vimeo_type != "channel"):
        return render_template(
            "index.html",
            error=gettext(u"URL not found"),
            bodyClass="home",
            title=gettext(u"URL not found")), 404

    vimeo_type = vimeo_type + "s"
    vids = VIMEO.get(('/{}/{}/videos?filter=embeddable&filter_embeddable=true').format(
        vimeo_type, vimeo_id), params={"fields": "name, pictures.uri, duration"})
    general = VIMEO.get(('/{}/{}').format(vimeo_type, vimeo_id),
                        params={"fields": "name, user.name"})

    if not vids:
        return render_template(
            "index.html",
            error=gettext(u"This album/channel is either empty, private or non-existing"),
            bodyClass="home",
            title=gettext(u"Can't handle album/channel"))

    regex_ids = re.compile(r"\/videos\/(\d+)\/pictures\/(\d+)")

    fetched_videos = vids.json()
    general_data = general.json()

    for data in fetched_videos["data"]:
        ids = regex_ids.match(data["pictures"]["uri"])
        start_time = snippet_start_at(data["duration"])
        end_time = start_time + int(read_config("SNIPPETLENGTH"))
        if end_time > data["duration"]:
            end_time = data["duration"]

       # video_list = 0: id, 1: provider, 2: title, 3: start, 4: end, 5: length, 6: thumbnail id

        if ids:
            video_list.append([
                ids.group(1),
                "vimeo",
                data["name"],
                start_time,
                end_time,
                data["duration"],
                ids.group(2)])

    debug(("\nRuntime: {}").format(flask_g.runtime()))
    return render_template(
        "play.html",
        videolist=video_list,
        playlistTitle=general_data["name"],
        playlistCreator=general_data["user"]["name"],
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + general_data["name"],
        message="vimeo-beta",
        runtime=flask_g.runtime())

@app.route("/vimeo/mix/<int:vimeo_id>")
@cache()
def mix_vimeo(vimeo_id):

    #TODO: validate given id

    """
    Fetch related content from Vimeo based on single video ID
    """

    video_list = []

    vids = VIMEO.get(('/videos/{}/videos?filter=related&per_page=25').format(
        vimeo_id), params={"fields": "name, pictures.uri, duration"})

    regex_ids = re.compile(r"\/videos\/(\d+)\/pictures\/(\d+)")

    fetched_videos = vids.json()

    for data in fetched_videos["data"]:
        ids = regex_ids.match(data["pictures"]["uri"])
        start_time = snippet_start_at(data["duration"])
        end_time = start_time + int(read_config("SNIPPETLENGTH"))
        if end_time > data["duration"]:
            end_time = data["duration"]

        if ids:
            video_list.append([
                ids.group(1),
                "vimeo",
                data["name"],
                start_time,
                end_time,
                data["duration"],
                ids.group(2)])

    debug(("\nRuntime: {}").format(flask_g.runtime()))

    return render_template(
        "play.html",
        videolist=video_list,
        playlistTitle=gettext(u"Vimeo mix"),
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + gettext(u"Vimeo mix"),
        message="vimeo-beta",
        runtime=flask_g.runtime())


@app.errorhandler(404)
@cache()
def four0four(_):

    """
    Handling of unavailable routes
    """

    return render_template(
        "index.html",
        error=gettext(u"URL not found"),
        bodyClass="home",
        title=gettext(u"URL not found")), 404

@babel.localeselector
def get_locale():

    """
    Supported languages for flask_babel (currently English as standard and German)
    """

    #TODO: amend "fr" when french version is ready
    return request.accept_languages.best_match(['de', 'en'])


if __name__ == "__main__":
    app.run(debug=read_config("DEBUG"))
