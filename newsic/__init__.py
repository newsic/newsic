"""
newsic main file for Flask
"""

from flask import Flask
from flask_babel import Babel

def create_app():
    app = Flask(__name__)
    Babel(app)

    with app.app_context():
        from . import index, youtube, vimeo, custom, autocomplete
        from newsic.functions import not_found
        
        app.register_blueprint(index.bp)
        app.register_blueprint(index.bp, url_prefix='/<lang_code>')
        app.register_blueprint(youtube.bp)
        app.register_blueprint(youtube.bp, url_prefix='/<lang_code>')
        app.register_blueprint(vimeo.bp)
        app.register_blueprint(vimeo.bp, url_prefix='/<lang_code>')
        app.register_blueprint(custom.bp)
        app.register_blueprint(custom.bp, url_prefix='/<lang_code>')
        app.register_blueprint(autocomplete.bp)

        app.register_error_handler(404, not_found)

    return app
