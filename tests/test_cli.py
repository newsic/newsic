import pytest

def test_flushcache(app, runner):
    with app.app_context():
        from newsic.functions import flushcache

        result = runner.invoke(flushcache)
        
        if app.config["CACHE"]:
            assert "Cache successfully flushed" in result.output
        else:
            assert "Cache inactive, unable to flush" in result.output
