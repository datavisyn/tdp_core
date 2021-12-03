from phovea_server import ns
from phovea_server.config import view as config_view
import memcache
import logging
import gevent
import gevent.lock

__author__ = 'Samuel Gratzl'
app = ns.Namespace(__name__)
conf = config_view('tdp_core')

mc = memcache.Client(conf.get('memcached'), debug=0)
mc_prefix = 'clue_'

_log = logging.getLogger(__name__)


class Screenshotter(object):
    def __init__(self):
        self._lock = gevent.lock.BoundedSemaphore(1)
        self._timeout = None
        self._driver = None
        pass

    def _timed_out(self):
        try:
            _log.info('quiting driver')
            self._driver.quit()
            _log.info('quitted driver')
        finally:
            self._driver = None

    def _get(self):
        from selenium import webdriver

        if self._timeout is not None:
            gevent.kill(self._timeout)
            self._timeout = None

        if self._driver is None:
            _log.info('create driver')
            options = webdriver.ChromeOptions()
            options.debugger_address = conf.chromeAddress
            self._driver = webdriver.Chrome(chrome_options=options)
            self._driver.implicitly_wait(30)  # wait at most 30 seconds
        return self._driver

    def _free(self):
        # schedule that the driver will be cleaned up if not used
        self._timeout = gevent.spawn_later(600, self._timed_out)

    def take(self, url, body=None):
        with self._lock:
            try:
                driver = self._get()
                _log.info('url %s', url)
                driver.get(url)

                if body is not None:
                    try:
                        body(driver)
                    except Exception as e:
                        _log.exception('cannot fullfil query %s', e)
                _log.info('take screenshot')
                obj = driver.get_screenshot_as_png()
                return obj
            finally:
                self._free()


screenshotter = Screenshotter()


def randomword(length):
    import random
    import string
    return ''.join(random.choice(string.ascii_lowercase) for i in range(length))


def generate_url(app, prov_id, state):
    # add a random parameter to force a proper reload
    base = '{s}/?clue_random={r}#clue_graph={g}&clue_state={n}&clue=P&clue_store=remote&clue_headless=Y'
    return base.format(s=conf.server, g=prov_id, n=state, r=randomword(5))


def generate_key(app, prov_id, state, format):
    return 'a={a},p={g},s={s},f={f}'.format(a=app, g=prov_id, s=state, f=format)


def generate_slide_url(app, prov_id, slide):
    base = '{s}/?clue_random={r}#clue_graph={g}&clue_slide={n}&clue=P&clue_store=remote&clue_headless=Y'
    return base.format(s=conf.server, g=prov_id, n=slide, r=randomword(5))


def generate_slide_key(app, prov_id, slide, force):
    return 'a={a},p={g},u={s},f={f}'.format(a=app, g=prov_id, s=slide, f=format)


@app.route('/dump/<path:page>')
def test(page):
    obj = screenshotter.take('http://' + page)
    return ns.Response(obj, mimetype='image/png')


def create_via_selenium(url, width, height):
    def eval_clue(driver):
        driver.find_element_by_css_selector('main')
        found = None
        tries = 0
        while not found and tries < 3:
            tries += 1
            for entry in driver.get_log('browser'):
                _log.info(entry)
            found = driver.find_element_by_css_selector('body.clue_jumped')

        if found:
            _log.info('found jumped flag: {}'.format(found.get_attribute('class')))
        else:
            _log.warn('cannot find jumped flag after 3 x 30 seconds, give up and take a screenshot')

    return screenshotter.take(url, eval_clue)


def _create_screenshot_impl(app, prov_id, state, format, width=1920, height=1080, force=False):
    url = generate_url(app, prov_id, state)

    key = mc_prefix + url + 'w' + str(width) + 'h' + str(height)

    obj = mc.get(key) if not force else None
    if not obj:
        _log.info('requesting url %s', url)
        obj = create_via_selenium(url, width, height)
        mc.set(key, obj)
    return obj


def _create_preview_impl(app, prov_id, slide, format, width=1920, height=1080, force=False):
    url = generate_slide_url(app, prov_id, slide)

    key = mc_prefix + url + 'w' + str(width) + 'h' + str(height)

    obj = mc.get(key) if not force else None
    if not obj:
        _log.debug('requesting url %s', url)
        obj = create_via_selenium(url, width, height)
        mc.set(key, obj)
    return obj


def fix_format(format):
    return 'jpeg' if format == 'jpg' else format


@app.route('/screenshot/<app>/<prov_id>/<state>.<format>')
def create_screenshot(app, prov_id, state, format):
    width = ns.request.args.get('width', 1920)
    height = ns.request.args.get('height', 1080)
    force = ns.request.args.get('force', None) is not None

    s = _create_screenshot_impl(app, prov_id, state, format, width, height, force)
    return ns.Response(s, mimetype='image/' + fix_format(format))


def to_thumbnail(s, width, format):
    import PIL.Image
    import io

    b = io.BytesIO(s)
    img = PIL.Image.open(b)

    wpercent = (width / float(img.size[0]))
    height = int(float(img.size[1]) * float(wpercent))
    img.thumbnail((width, height), PIL.Image.ANTIALIAS)

    b = io.BytesIO()
    img.save(b, fix_format(format))
    b.seek(0)
    obj = b.read()
    return obj


@app.route('/thumbnail/<app>/<prov_id>/<state>.<format>')
def create_thumbnail(app, prov_id, state, format):
    format = fix_format(format)
    width = int(ns.request.args.get('width', 128))
    force = ns.request.args.get('force', None) is not None

    key = mc_prefix + generate_key(app, prov_id, state, format) + 't' + str(width)

    obj = mc.get(key)
    if not obj or force:
        s = _create_screenshot_impl(app, prov_id, state, format, force=force)
        obj = to_thumbnail(s, width, format)
        mc.set(key, obj)

    return ns.Response(obj, mimetype='image/' + format)


@app.route('/preview/<app>/<prov_id>/<slide>.<format>')
def create_preview(app, prov_id, slide, format):
    width = ns.request.args.get('width', 1920)
    height = ns.request.args.get('height', 1080)
    force = ns.request.args.get('force', None) is not None

    s = _create_preview_impl(app, prov_id, slide, format, width, height, force)
    return ns.Response(s, mimetype='image/' + fix_format(format))


@app.route('/preview_thumbnail/<app>/<prov_id>/<slide>.<format>')
def create_preview_thumbnail(app, prov_id, slide, format):
    format = fix_format(format)
    width = int(ns.request.args.get('width', 128))
    force = ns.request.args.get('force', None) is not None

    key = mc_prefix + generate_slide_key(app, prov_id, slide, format) + 't' + str(width)

    obj = mc.get(key)
    if not obj or force:
        s = _create_preview_impl(app, prov_id, slide, format, force=force)
        obj = to_thumbnail(s, width, format)
        mc.set(key, obj)

    return ns.Response(obj, mimetype='image/' + format)


def create():
    """
     entry point of this plugin
    """
    app.debug = True
    return app


if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0')
