"""
Vimeo functions (album, channel, mix)
"""

from flask import (
    Blueprint, g, render_template
)

from newsic.functions import (
    cache, get_locale, gettext, snippet_start_at, debug, read_config
)

import re

try:
    from vimeo import VimeoClient
except ImportError:
    print("Warning: Vimeo libary is missing")

bp = Blueprint('vimeo', __name__)

VIMEO = VimeoClient(
    token=read_config("VIMEO_TOKEN"),
    key=read_config("VIMEO_KEY"),
    secret=read_config("VIMEO_SECRET"))

# TODO: check url earlier (vimeo_type can only be either "channel" or "album")
@bp.route("/vimeo/<string:vimeo_type>/<int:vimeo_id>")
#@cache()
def play_vimeo(vimeo_type, vimeo_id):

    """
    Fetch videos from Vimeo
    """

    video_list = []

    if (vimeo_type != "album") and (vimeo_type != "channel"):
        return render_template(
            "index.html",
            getlocale=get_locale(),
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
            getlocale=get_locale(),
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

    debug(("\nRuntime: {}").format(g.runtime()))
    return render_template(
        "play.html",
        getlocale=get_locale(),
        videolist=video_list,
        playlistTitle=general_data["name"],
        playlistCreator=general_data["user"]["name"],
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + general_data["name"],
        message="vimeo-beta",
        runtime=g.runtime())

@bp.route("/vimeo/mix/<int:vimeo_id>")
@cache()
def mix_vimeo(vimeo_id):

    #TODO: validate given id

    """
    Fetch related content from Vimeo based on single video ID
    """

    video_list = []

    vids = VIMEO.get(('/videos/{}/videos?filter=related&per_page=20').format(
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

    debug(("\nRuntime: {}").format(g.runtime()))

    return render_template(
        "play.html",
        getlocale=get_locale(),
        videolist=video_list,
        playlistTitle=gettext(u"Vimeo mix"),
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + gettext(u"Vimeo mix"),
        message="vimeo-beta",
        runtime=g.runtime())