"""
Basic deployment script (for Gunicorn or similar tools)
"""

from newsic import create_app
app = create_app()

# http://flask.pocoo.org/docs/1.0/deploying/wsgi-standalone/#proxy-setups
# fixes possible redirects to localhost:port
from werkzeug.contrib.fixers import ProxyFix
app.wsgi_app = ProxyFix(app.wsgi_app)
