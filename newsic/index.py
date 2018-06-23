"""
Handling of index page and POST requests to /
"""

from flask import (
    Blueprint, redirect, render_template, request, url_for
)

from newsic.functions import (
    cache, get_locale, gettext, debug
)

import re

bp = Blueprint('index', __name__)

@bp.route("/")
@cache()
def index():

    """
    Rendering of home page
    """

    return render_template(
        "index.html",
        getlocale=get_locale(),
        bodyClass="home",
        title=gettext(u"Home")
    )

@bp.route("/", methods=["POST"])
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
                "youtube.play_youtube",
                youtube_playlist="PLdduFHK2eLvf6RE6a7l0jLNYFsYU_ALK7"))

    if request.form["url"] == "schwifty":
        route = redirect(
            url_for(
                "youtube.play_youtube",
                youtube_playlist="PLdduFHK2eLvdwarNDUhOyUO2dGW5sCguk"))

    if request.form["url"] == "versions":
        route = redirect(
            url_for(
                "youtube.play_youtube",
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
                "youtube.mix_youtube",
                video_id=youtube_video.group(1)))

    if youtube_playlist:
        debug(("Received a YouTube playlist: {}").format(youtube_playlist.group(1)))

        route = redirect(
            url_for(
                "youtube.play_youtube",
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
                "vimeo.play_vimeo",
                vimeo_type=vimeo_type,
                vimeo_id=vimeo.group(2)))

    if route:
        return route

    # redirect to index page in case there's no valuable user input
    debug("No music found")

    return render_template(
        "index.html",
        getlocale=get_locale(),
        error=gettext(u"No music found"),
        bodyClass="home",
        title=gettext(u"No music found"))
