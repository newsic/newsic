from flask import Flask, render_template, request, redirect, url_for
from re import compile
from urllib import request as urlrequest
from json import loads
from math import fmod

from vimeo import VimeoClient

app = Flask(__name__)

# config imports
app.config.from_object("config.general")
app.config.from_object("config.local")
#app.config.from_object("config.server")


def debug(text):
	if app.config["NEWSICDEBUG"]:
		print(text)

# index page
@app.route("/")
def index():
    return render_template(
    	"index.html",
    	bodyClass = "home",
    	title = "Home"
    )

# check of input url (redirects to index page )
@app.route("/play", methods = ["POST"])
@app.route("/", methods = ["POST"])
def index_POST():

	url = request.form["url"]

	# check for youtube urls (playlists)
	youtube = compile(r"(?:https?:\/\/)*(?:w{0,3}|m).?youtube.com\/.*list=(.+)")
	vimeo = compile(r"(?:https?:\/\/)*(?:w{0,3}).?vimeo.com\/.*album\/(\d+)")

	yt_playlist = youtube.match(url)
	vim_playlist = vimeo.match(url)

	if(yt_playlist):
		debug(("Found a YouTube playlist: {0}").format(yt_playlist.group(1)))

		return redirect(url_for(
				"play_youtube",
				youtubePlaylist = yt_playlist.group(1)
			))

	if(vim_playlist):
		debug(("Found a Vimeo playlist: {0}").format(vim_playlist.group(1)))

		return redirect(url_for(
				"play_vimeo",
				vimeoPlaylist = vim_playlist.group(1)
			))

	# redirect to index page in case there's no valuable user input
	else:
		debug("No music found")
		return render_template(
			"index.html",
			error = "No music found.",
			bodyClass = "home",
			title = "No music found"
		)

# play some music from YouTube (currently only works with playlists <= 50 videos)
@app.route("/play/youtube/<youtubePlaylist>")
def play_youtube(youtubePlaylist):

	if youtubePlaylist:
		maxResults = 50
		videoIds = []
		videolist = []
		i = 0

		# fetch general information about the playlist
		api_playlist = ("https://www.googleapis.com/youtube/v3/playlists?part=snippet&id={0}&fields=items&key={1}").format(youtubePlaylist, app.config["YOUTUBE_API_KEY"])
		response_playlist = urlrequest.urlopen(api_playlist)#.decode("utf-8")
		data_playlist = loads(response_playlist.read().decode())

		#TODO: check if playlist is private/not listed etc..

		playlistTitle = data_playlist["items"][0]["snippet"]["title"]
		playlistCreator = data_playlist["items"][0]["snippet"]["channelTitle"]

		# fetch video ids from playlist
		requestVideoIds = ("https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId={0}&fields=items%2FcontentDetails%2CnextPageToken%2CpageInfo&key={1}&maxResults={2}").format(youtubePlaylist, app.config["YOUTUBE_API_KEY"], maxResults)

		receiveVideoIds = urlrequest.urlopen(requestVideoIds)#.decode("utf-8")
		jsonVideoIds = loads(receiveVideoIds.read().decode())

		for items in jsonVideoIds["items"]:
			videoIds.append(items["contentDetails"]["videoId"])

		while "nextPageToken" in jsonVideoIds:

			requestVideoIds = ("https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId={0}&fields=items%2FcontentDetails%2CnextPageToken%2CpageInfo&key={1}&maxResults={2}&pageToken={3}").format(youtubePlaylist, app.config["YOUTUBE_API_KEY"], maxResults, jsonVideoIds["nextPageToken"])

			receiveVideoIds = urlrequest.urlopen(requestVideoIds)#.decode("utf-8")
			jsonVideoIds = loads(receiveVideoIds.read().decode())

			for items in jsonVideoIds["items"]:
				videoIds.append(items["contentDetails"]["videoId"])

		iterations = round(len(videoIds) / maxResults, 0)
		modulo = fmod(len(videoIds), maxResults)

		if modulo > 0 and iterations > 1:
			iterations = iterations + 1

		debug(iterations * maxResults)
		debug(iterations)

		rangeStart = 0
		rangeEnd = maxResults



		while iterations >= 0:

			videoIds_part = ','.join(videoIds[rangeStart:rangeEnd])

			url = ("https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,status&id={0}&fields=items(contentDetails,snippet,status)&key={1}").format(videoIds_part, app.config["YOUTUBE_API_KEY"])
			response = urlrequest.urlopen(url)#.decode("utf-8")
			data = loads(response.read().decode())

			# iterate through videolist and use every video id to fetch more details
			for video in videoIds[rangeStart:rangeEnd]:
				if data["items"]:
					embedStatus = data["items"][i]["status"]["embeddable"]
					privacyStatus = data["items"][i]["status"]["privacyStatus"]
					uploadStatus = data["items"][i]["status"]["uploadStatus"]

					debug(("\niterations left #{0} , video #{1}/{2}: {3} (ID: {4}) \nprivacy: {5} | upload status: {6}").format(iterations, i, len(videoIds), data["items"][i]["snippet"]["title"], video, privacyStatus, uploadStatus))

					if(embedStatus and (privacyStatus == "public" or privacyStatus == "unlisted") and uploadStatus == "processed"):

						blocked = []
						allowed = []

						# make sure we know where videos are not available (important for later use in template "play")
						if "regionRestriction" in data["items"][i]["contentDetails"]:

							if "blocked" in data["items"][i]["contentDetails"]["regionRestriction"]:
								for country in data["items"][i]["contentDetails"]["regionRestriction"]["blocked"]:
									blocked.append(country)
								debug(("Blocked in these countries: {0}").format(str(blocked)))

							if "allowed" in data["items"][i]["contentDetails"]["regionRestriction"]:
								for country in data["items"][i]["contentDetails"]["regionRestriction"]["allowed"]:
									allowed.append(country)
								debug(("Only allowed in these countries: {0}").format(str(allowed)))

						# convert YouTube's time format to hours, minutes and seconds
						hours = minutes = seconds = 0

						# todo: improve regex
						length_raw = compile(r"PT(?P<h>\d*H)*(?P<m>\d*M)*(?P<s>\d*S)*")
						length = length_raw.match(data["items"][i]["contentDetails"]["duration"])

						if length.group("h") is not None:
							hours = length.group("h").replace("H", "")

						if length.group("m") is not None:
							minutes = length.group("m").replace("M", "")

						if length.group("s") is not None:
							seconds = length.group("s").replace("S", "")

						length_in_sec = int(hours) * 60 * 60 + int(minutes) * 60 + int(seconds)
						timeMiddle = length_in_sec / 2

						videolist.append([
							video,
							timeMiddle,
							timeMiddle + app.config["SNIPPETLENGTH"],
							data["items"][i]["snippet"]["title"],
							blocked,
							allowed,
							length_in_sec
						])
					else:
						debug("Embedding is not allowed, so this video was skipped.")
					i = i + 1

			iterations = iterations - 1
			i = 0
			rangeStart = rangeStart + maxResults
			rangeEnd = rangeEnd + maxResults

	return render_template(
		"youtube.html",
		videolist = videolist,
		playlistTitle = playlistTitle,
		playlistCreator = playlistCreator,
		playlistVideoAmount = len(videolist),
		playlistLength = int(float((len(videolist) * app.config["SNIPPETLENGTH"]) / 60)),
		title = "Loading..."
	)


# heavy in development!
@app.route("/play/vimeo/<vimeoPlaylist>")
def play_vimeo(vimeoPlaylist):

	videolist = []

	v = VimeoClient(
	    token = app.config["VIMEO_TOKEN"],
	    key = app.config["VIMEO_KEY"],
	    secret = app.config["VIMEO_SECRET"])

	rawResponse_vids = v.get(('/albums/{0}/videos').format(vimeoPlaylist))
	rawResponse_general = v.get(('/albums/{0}').format(vimeoPlaylist))

	regex_ids = compile(r"\/videos\/(\d+)\/pictures\/(\d+)")

	fetchedVideos = rawResponse_vids.json()
	fetchedGeneralData = rawResponse_general.json()

	playlistTitle = fetchedGeneralData["name"]
	playlistCreator = fetchedGeneralData["user"]["name"]

	for data in fetchedVideos["data"]:
		ids = regex_ids.match(data["pictures"]["uri"])

		if(ids):
			title = data["name"]
			length_in_sec = data["duration"]
			timeMiddle = length_in_sec / 2
			videoId = ids.group(1)
			thumbnailId = ids.group(2)

			videolist.append([
				videoId,
				thumbnailId,
				timeMiddle,
				timeMiddle + app.config["SNIPPETLENGTH"],
				title,
				length_in_sec
			])

	return render_template(
		"vimeo.html",
		videolist = videolist,
		playlistTitle = playlistTitle,
		playlistCreator = playlistCreator,
		playlistVideoAmount = len(videolist),
		playlistLength = int(float((len(videolist) * app.config["SNIPPETLENGTH"]) / 60)),
		title = "Loading..."
	)

@app.errorhandler(404)
def four0four(error):
    return render_template(
    	"index.html",
    	error = "Page not found.",
    	bodyClass = "home",
    	title = "Page not found"
    ), 404

if __name__ == "__main__":
    app.run(debug = app.config["DEBUG"])
