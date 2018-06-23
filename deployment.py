"""
Basic deployment script (for Gunicorn or similar tools)
"""

from newsic import create_app
app = create_app()
