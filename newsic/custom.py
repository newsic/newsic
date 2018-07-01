"""
Custom playlists (very early status as playlist creator is not released yet)
"""

from flask import (
    Blueprint, g, render_template
)

from newsic.functions import (
    cache, get_locale, gettext, snippet_start_at, debug, read_config
)

from newsic.youtube import yt_grab

import re

try:
    from vimeo import VimeoClient
except ImportError:
    print("Warning: Vimeo libary is missing")

bp = Blueprint('custom', __name__)

VIMEO = VimeoClient(
    token=read_config("VIMEO_TOKEN"),
    key=read_config("VIMEO_KEY"),
    secret=read_config("VIMEO_SECRET"))

@bp.route("/custom/<path:path>")
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
            getlocale=get_locale(),
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

        message = "custom-vimeo-beta"

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

            # video_list: 0: id, 1: provider, 2: title, 3: start, 4: end, 5: length, 6: thumbnail id

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
        getlocale=get_locale(),
        videolist=video_list,
        playlistTitle=gettext(u"Custom playlist"),
        playlistCreator=gettext(u"Anonymous"),
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + gettext(u"Custom playlist"),
        message=message)
