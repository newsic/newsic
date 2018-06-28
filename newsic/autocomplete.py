"""
API requests for autocomplete results
"""

"""
Ideas

* prefix support (to search only on YouTube or Vimeo) -> :vi or :yt

"""

from flask import (
    Blueprint, request
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

@bp.route("/search", methods=["POST"])
def search():

    """
    Handling of POST requests for autocomplete.js
    """

    if request.method == "POST":

        max_results = 3
        result = []

        debug(("Incoming POST request: {}").format(request.json["search"]))

        #TODO: use fields for filtering the results
        yt_search_request = (
            "{}/search?q={}&type=playlist&part=id,snippet"
            + "&maxResults={}&key={}").format(
                read_config("YOUTUBE_API_URL"), quote(request.json["search"]),
                max_results, read_config("YOUTUBE_API_KEY"))
        yt_search_response = urllib_request.urlopen(yt_search_request)
        youtube = loads(yt_search_response.read().decode())

        VIMEO = VimeoClient(
            token=read_config("VIMEO_TOKEN"),
            key=read_config("VIMEO_KEY"),
            secret=read_config("VIMEO_SECRET"))

        vim_search_request = VIMEO.get(("/channels?query={}&per_page={}").format(quote(request.json["search"]), max_results), params={"fields": "name, uri, pictures.uri, metadata.connections.videos.total"})

        vimeo = vim_search_request.json()

        for playlist in youtube["items"]:

            #TODO: use fields for filtering the results

            req = (
                "{}/playlistItems?playlistId={}"
                + "&part=id&fields=pageInfo(totalResults)"
                + "&maxresults=1&key={}").format(
                    read_config("YOUTUBE_API_URL"), playlist["id"]["playlistId"], read_config("YOUTUBE_API_KEY"))
            request_send = urllib_request.urlopen(req)
            videos_in_playlist = loads(request_send.read().decode())

            if "thumbnails" in playlist["snippet"]:
                thumbnail_url = playlist["snippet"]["thumbnails"]["medium"]["url"]

            #TODO: decide what to return in case of missing thumbnail
            else:
                thumbnail_url = ""

            result.append({
                "source": "youtube",
                "id": playlist["id"]["playlistId"],
                "title": playlist["snippet"]["title"],
                "thumb": thumbnail_url,
                "amount": videos_in_playlist["pageInfo"]["totalResults"]})

        for video in vimeo["data"]:
            result.append({
                "source": "vimeo",
                "id": video["uri"].split("/")[2],
                "title": video["name"],
                "thumb": ("https://i.vimeocdn.com/video/{}_100x75.jpg").format(video["pictures"]["uri"].split("/")[4]),
                "amount": video["metadata"]["connections"]["videos"]["total"]
            })


        return dumps(result)
