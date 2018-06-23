"""
API requests for autocomplete results
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

bp = Blueprint('autocomplete', __name__)

@bp.route("/search", methods=["POST"])
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
                read_config("YOUTUBE_API_URL"), quote(request.json["search"]),
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
                    read_config("YOUTUBE_API_URL"), playlist["id"]["playlistId"], read_config("YOUTUBE_API_KEY"))
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
