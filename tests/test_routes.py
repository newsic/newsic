import pytest

@pytest.mark.parametrize("route, expected", [
    ("/youtube/PLdduFHK2eLvfGM7ADIbCgWHFRvu1yBNj0/", "Now, Now - MJ"),
    ("/vimeo/album/3951181/", "Rollercoaster Girl")
])
def test_routes(client, route, expected):
    response = client.get(route)
    assert expected.encode('ascii') in response.data


@pytest.mark.parametrize("route, expected", [
    ("/youtube/invalid-playlist/test/", "URL not found"),
    ("/youtube/invalid-playlist/", "This playlist is either empty, private or non-existing"),
    ("/vimeo/channel/invalid-channel/", "This album/channel is either empty, private or non-existing")
])
def test_routes_i18n_en(client, route, expected, app):
    with app.app_context():
        app.config['BABEL_DEFAULT_LOCALE'] = 'en'
        response = client.get(route)
        assert expected.encode('ascii') in response.data


@pytest.mark.parametrize("route, expected", [
    ("/youtube/invalid-playlist/test/", "URL nicht gefunden"),
    ("/youtube/invalid-playlist/", "Diese Playlist ist entweder leer, privat oder existiert nicht"),
    ("/vimeo/channel/invalid-channel/", "Dieses Album bzw. dieser Channel ist entweder leer, privat oder existiert nicht")
])
def test_routes_i18n_de(client, route, expected, app):
    with app.app_context():
        app.config['BABEL_DEFAULT_LOCALE'] = 'de'
        response = client.get(route)
        assert expected.encode('ascii') in response.data
