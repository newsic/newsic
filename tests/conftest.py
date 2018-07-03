import pytest
from newsic import create_app

@pytest.fixture
def app():
    app = create_app()
    with app.app_context():
        app.config.from_object('newsic.config.Local')
        app.config['TESTING'] = True
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    """test runner for cli commands"""
    return app.test_cli_runner()
