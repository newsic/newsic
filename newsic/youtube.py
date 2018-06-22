"""
YouTube functions (playlist, mix)
"""

from flask import (
    Blueprint, g, redirect, render_template, request, url_for
)

from newsic.functions import (
    cache, get_locale, gettext, snippet_start_at, debug, read_config
)

import re

from urllib import request as urllib_request
from urllib.parse import quote
from json import loads, dumps
from random import randrange

bp = Blueprint('youtube', __name__)

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
                    read_config("YOUTUBE_API_URL"), playlist_id, read_config("YOUTUBE_API_KEY"),
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
        request_iteration = len(video_ids) % max_results
        if len(video_ids) >= max_results:
            request_iteration = request_iteration + 1


    range_start = 0
    range_end = max_results
    video_list = []
    
    while request_iteration > 0:
        video_ids_part = ','.join(video_ids[range_start:range_end])
        #TODO: use fields for filtering the results
        url = ("{}/videos?part=contentDetails,snippet,status&id={}&key={}").format(
            read_config("YOUTUBE_API_URL"), video_ids_part, read_config("YOUTUBE_API_KEY"))
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

# TODO: rename yt_general_playlist_info
def yt_general_playlist_info(playlist_id):

    """
    Fetch general information about the playlist (defined by given playlist_id)
    """

    request_data = (
        #TODO: use fields for filtering the results
        "{}/playlists?part=snippet,status&id={}"
        + "&fields=items&key={}").format(
            read_config("YOUTUBE_API_URL"), playlist_id, read_config("YOUTUBE_API_KEY"))
    data_response = loads(urllib_request.urlopen(request_data).read().decode())

    if data_response["items"]:
        return data_response["items"][0]["snippet"]

    # playlist is either private or empty
    return False


@bp.route("/youtube/mix/<video_id>")
@cache()
def mix_youtube(video_id):

    """
    Fetch a playlist from YouTube based on a single video
    TODO: improve performance
    """

    #TODO: use fields for filtering the results
    # needed: snippet title

    api_get_video_title = (
        "{}/videos?id={}&part=snippet"
        + "&key={}").format(
            read_config("YOUTUBE_API_URL"), video_id, read_config("YOUTUBE_API_KEY"))
    response_title = urllib_request.urlopen(api_get_video_title)
    data_title = loads(response_title.read().decode())

    if data_title["items"]:

        video_title = data_title["items"][0]["snippet"]["title"]
        video_title_nospaces = video_title.replace(" ", "+")

        max_results = 15

        #TODO: use fields for filtering the results
        # needed: ["pageInfo"]["totalResults"], playlistID (random one from "items")
        api_search_with_title = (
            "{}/search?q={}&type=playlist&part=id"
            + "&maxResults={}&key={}").format(
                read_config("YOUTUBE_API_URL"), quote(video_title_nospaces),
                max_results, read_config("YOUTUBE_API_KEY"))
        response_search = urllib_request.urlopen(api_search_with_title)
        data_search = loads(response_search.read().decode())

        if data_search["pageInfo"]["totalResults"] == 0:
            return render_template(
                "index.html",
                getlocale=get_locale(),
                error=gettext(u"No mix available for this video"),
                bodyClass="home",
                title=gettext(u"No mix available"))

        randnum = randrange(max_results)

        if data_search["pageInfo"]["totalResults"] < max_results:
            randnum = randrange(data_search["pageInfo"]["totalResults"])

        return redirect(
            url_for(
                "youtube.play_youtube",
                youtube_playlist=data_search["items"][randnum]["id"]["playlistId"]))

    return render_template(
        "index.html",
        getlocale=get_locale(),
        error=gettext(u"No mix available for this video"),
        bodyClass="home",
        title=gettext(u"No mix available"))

@bp.route("/youtube/<youtube_playlist>")
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
            getlocale=get_locale(),
            error=gettext(u"This playlist is either empty, private or non-existing"),
            bodyClass="home",
            title=gettext(u"Invalid playlist"))

    # TODO: rename yt_grab
    video_list = yt_grab(playlist_id=youtube_playlist)

    debug(("\nRuntime: {}").format(g.runtime()))
    return render_template(
        "play.html",
        getlocale=get_locale(),
        videolist=video_list,
        playlistTitle=general_info["title"],
        playlistCreator=general_info["channelTitle"],
        playlistVideoAmount=len(video_list),
        playlistLength=int(float((len(video_list) * int(read_config("SNIPPETLENGTH"))) / 60)),
        title=video_list[0][2] + " - " + general_info["title"],
        runtime=g.runtime())