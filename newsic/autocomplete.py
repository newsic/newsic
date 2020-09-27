"""
API requests for autocomplete results
"""

"""
Ideas

* prefix support (to search only on YouTube or Vimeo) -> :vi or :yt

"""

from flask import (
    Blueprint, request, Response
)

from werkzeug.datastructures import (
    Headers
)

from newsic.functions import (
    cache, debug, read_config
)

from urllib.parse import quote
from urllib import request as urllib_request
from json import loads, dumps

try:
    from vimeo import VimeoClient
except ImportError:
    print("Warning: Vimeo libary is missing")

bp = Blueprint('autocomplete', __name__)

@bp.route("/search", methods=["OPTIONS"])
def options():

    """
    Preflight request on foreign origins (e.g. newsic projectpage)
    """

    headers = Headers()
    headers.add('Access-Control-Allow-Origin', 'https://newsic.io')
    #headers.add('Access-Control-Allow-Origin', '*')
    headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return Response('', 200, headers)

@bp.route("/search", methods=["POST"])
def search():

    """
    Handling of POST requests for autocomplete.js
    """

    max_results = 3
    result = []

    debug(("Incoming POST request: {}").format(request.json["search"]))

    yt_search_request = (
        "{}/search?q={}&type=playlist&part=id,snippet"
        + "&fields=items(id/playlistId,snippet(thumbnails/medium/url,title))"
        + "&maxResults={}&key={}").format(
            read_config("YOUTUBE_API_URL"), quote(request.json["search"]),
            max_results, read_config("YOUTUBE_API_KEY"))
    try:
        yt_search_response = urllib_request.urlopen(yt_search_request)
        youtube = loads(yt_search_response.read().decode())

        for playlist in youtube["items"]:

            req = (
                "{}/playlistItems?playlistId={}"
                + "&part=id&fields=pageInfo/totalResults"
                + "&maxresults=1&key={}").format(
                    read_config("YOUTUBE_API_URL"), playlist["id"]["playlistId"], read_config("YOUTUBE_API_KEY"))
            request_send = urllib_request.urlopen(req)
            videos_in_playlist = loads(request_send.read().decode())

            #TODO: decide what to return in case of missing thumbnail
            thumbnail_url = ""

            if "thumbnails" in playlist["snippet"]:
                # api call needed as playlist thumbnail != thumbnail of first video (or not inevitable)
                thumbnail_url = playlist["snippet"]["thumbnails"]["medium"]["url"]

            result.append({
                "source": "youtube",
                "id": playlist["id"]["playlistId"],
                "title": playlist["snippet"]["title"],
                "thumb": thumbnail_url,
                "amount": videos_in_playlist["pageInfo"]["totalResults"]})
    except urllib_request.URLError as error:
        debug(('YouTube API request failed: {} {}').format(error.code, error.reason))
    except:
        debug('YouTube API request failed')

    VIMEO = VimeoClient(
    token=read_config("VIMEO_TOKEN"),
    key=read_config("VIMEO_KEY"),
    secret=read_config("VIMEO_SECRET"))

    vim_search_request = VIMEO.get(("/channels?query={}&per_page={}").format(quote(request.json["search"]), max_results), params={"fields": "name, uri, pictures.uri, metadata.connections.videos.total"})
    vimeo = vim_search_request.json()
    for video in vimeo["data"]:
        result.append({
            "source": "vimeo",
            "id": video["uri"].split("/")[2],
            "title": video["name"],
            #TODO: check if thumbnail of first video is always thumbnail of channel (or customizable as on YouTube)
            "thumb": ("https://i.vimeocdn.com/video/{}_100x75.jpg").format(video["pictures"]["uri"].split("/")[4]),
            "amount": video["metadata"]["connections"]["videos"]["total"]
        })

    headers = Headers()
    headers.add('Access-Control-Allow-Origin', 'https://newsic.io')
    #headers.add('Access-Control-Allow-Origin', '*')
    headers.add('Access-Control-Allow-Headers', 'Content-Type')
    return Response(dumps(result), 200, headers)