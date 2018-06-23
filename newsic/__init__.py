"""
newsic main file for Flask
"""

from flask import Flask

def create_app():
    app = Flask(__name__)

    with app.app_context():
        from . import index, youtube, vimeo, custom, autocomplete

        app.register_blueprint(index.bp)
        app.register_blueprint(youtube.bp)
        app.register_blueprint(vimeo.bp)
        app.register_blueprint(custom.bp)
        app.register_blueprint(autocomplete.bp)

    return app
