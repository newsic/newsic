"""
Functions (environment, general, debug, plugin-related) and loading dependencies
"""

from flask import (
    current_app as app, g, request, render_template, url_for
)
from time import perf_counter
from click import echo as click_echo
from flask_babel import Babel, gettext

"""
Optional dependencies
"""

try:
    from flask_caching import Cache
    from flask_compress import Compress
    from htmlmin import Minifier
    from dotenv import load_dotenv, find_dotenv
except ImportError:
    pass

# for python-dotenv
from os import getenv

app.config.from_object('newsic.config.Local')
try:
    load_dotenv(find_dotenv(), override=True)
except:    
    pass

def read_config(value):

    """
    Import config from config.py
    Settings can be overwritten by .env file
    """

    if getenv(value):
        if getenv(value) == "True":
            return True
        if getenv(value) == "False":
            return False
        return getenv(value)
    if value in app.config:
        return app.config[value]

def not_found(_):

    """
    Handling of non-available routes
    """

    return render_template(
        "index.html",
        getlocale=get_locale(),
        error=gettext(u"URL not found"),
        bodyClass="home",
        title=gettext(u"URL not found")), 404

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

def debug(text):

    """
    Delivers output on debug mode (see config file) only
    """
    
    if app.debug:
        app.logger.debug(text)

"""
Flask-Caching
"""

if read_config("CACHE"):
    CACHE = Cache(app, config={'CACHE_TYPE': read_config("CACHE_TYPE"),
                        'CACHE_DIR': read_config("CACHE_DIR")})

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


"""
Flask-Compress
"""

if read_config("COMPRESS"):
    debug("Compression activated")
    Compress(app)


"""
htmlmin
"""

if read_config("MINIFY_PAGE"):
    debug("Minify activated")
    minify = Minifier(remove_comments=read_config("REMOVE_COMMENTS"),
                reduce_empty_attributes=read_config("REDUCE_EMPTY_ATTRIBUTES"),
                remove_empty_space=read_config("REMOVE_EMPTY_SPACE"),
                remove_all_empty_space=read_config("REMOVE_ALL_EMPTY_SPACE"),
                remove_optional_attribute_quotes=read_config("REMOVE_OPTIONAL_ATTRIBUTE_QUOTES"))

    @app.after_request
    def minify_the_page(response):
        if response.content_type == u'text/html; charset=utf-8':
            response.direct_passthrough = False
            response.set_data(
                minify.minify(response.get_data(as_text=True)))
            return response
        return response

if read_config("CACHE_MAX_AGE"):
    @app.after_request
    def add_header(response):

        """
        Append custom response header after finishing a request
        """

        response.cache_control.max_age = read_config("CACHE_MAX_AGE")
        return response

"""
Flask-Babel
"""

babel = Babel(app)

@app.url_defaults
def add_language_code(endpoint, values):
    values.setdefault('lang_code', None)

@app.url_value_preprocessor
def pull_lang_code(endpoint, values):
    if endpoint:
        g.lang_code = values.pop('lang_code', None)

@app.before_request
def ensure_lang_support():

    """
    Checks if requested language is supported 
    """
    
    lang_code = g.get('lang_code', None)
    if lang_code and lang_code not in read_config("LANGUAGES"):
        return render_template(
            "index.html",
            getlocale=request.accept_languages.best_match(read_config("LANGUAGES")),
            error=gettext(u"URL not found"),
            bodyClass="home",
            title=gettext(u"URL not found")), 404


@babel.localeselector
def get_locale():
    # use standard language as set in config.py
    if g.get('lang_code') in read_config("LANGUAGES"):
        return g.get('lang_code')

    # Open Graph/Facebook support
    if request.args.get("fb_locale") and request.args.get("fb_locale").partition("_")[0] in read_config("LANGUAGES"):
        return request.args.get("fb_locale").partition("_")[0]

    # best match (based on user request)
    bestmatch = request.accept_languages.best_match(read_config("LANGUAGES"))

    if bestmatch:
        return bestmatch

    # fall back to default language
    return read_config("BABEL_DEFAULT_LOCALE")
