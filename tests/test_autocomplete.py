import pytest
from json import loads, dumps

@pytest.mark.parametrize("value, result", [
    ("discover newsicly", "Discover newsicly IX (2018-05)"),
    ("https://www.youtube.com/watch?list=PLdduFHK2eLvfGM7ADIbCgWHFRvu1yBNj0", "Discover newsicly IX (2018-05)")
])
def test_autocomplete(client, value, result):
    response = client.post("/search",
        data=dumps(dict(search=value)),
        content_type='application/json')
    assert loads(response.data)[0]["title"] == result
