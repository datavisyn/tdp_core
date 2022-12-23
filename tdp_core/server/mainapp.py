import logging
import os
import re
from builtins import next

from flask import Flask, send_from_directory
from werkzeug.security import safe_join

from .. import manager

_log = logging.getLogger(__name__)


black_list = re.compile(r"(.*\.(py|pyc|gitignore|gitattributes)|(\w+)/((config|package)\.json|_deploy/.*))")
public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "public"))


def _is_on_black_list(path):
    # print 'check',path,black_list.match(path) is not None
    return black_list.match(path) is not None


def _deliver_production(path):
    # print path
    if path.endswith("/"):
        path += "index.html"
    if _is_on_black_list(path):
        return "This page does not exist", 404
    # serve public
    return send_from_directory(public_dir, path)


def _deliver(path):
    # print path
    if path.endswith("/"):
        path += "index.html"
    if _is_on_black_list(path):
        return "This page does not exist", 404

    # serve public
    if os.path.exists(safe_join(public_dir, path)):  # type: ignore
        return send_from_directory(public_dir, path)

    # check all plugins
    elems = path.split("/")
    if len(elems) > 0:
        plugin_id = elems[0]
        elems[0] = "build"
        from .. import manager

        plugin = next((p for p in manager.registry.plugins if p.id == plugin_id), None)
        if plugin:
            dpath = safe_join(plugin.folder, "/".join(elems))  # type: ignore
            if os.path.exists(dpath):  # type: ignore
                # send_static_file will guess the correct MIME type
                # print 'sending',dpath
                return send_from_directory(plugin.folder, "/".join(elems))  # type: ignore

    return "This page does not exist", 404


def _generate_index():
    text = [
        """
    <!DOCTYPE html><html><head lang="en">
    <meta charset="UTF-8"> <title>Caleydo Web Apps</title>
    <link href="//fonts.googleapis.com/css?family=Roboto:500,400" rel="stylesheet" type="text/css">
    <link href="assets/main.css" rel="stylesheet" type="text/css"></head>
    <body><div class="container"> <header>
    <h1><img src="assets/caleydo_text_right.svg" alt="Caleydo" width="200" height="40"> Web Apps</h1> </header>
    <main> <nav id="apps"> <input type="search" id="search" class="search" placeholder="Search App" autocomplete="off"/>
    <div class="keyboard-navigation-hint"> <span>Jump to an app:</span> <span><b>&#8593;</b><b>&#8595;</b> to navigate</span> <span><b>&#8629;</b> to select</span> </div>
    <ul class="list">
    """
    ]

    # filter list and get title for apps
    from .. import manager

    apps = sorted((p for p in manager.registry.plugins if p.is_app()), key=lambda p: p.title)

    for app in apps:
        text.append("<li>")
        text.append(
            '<a class="appinfo" href="/'
            + app.id
            + '/"><span class="title">'
            + app.title
            + '</span><span class="name">'
            + app.name
            + '</span><span class="description">'
            + app.description
            + "</span></a>"
        )
        text.append('<div class="links">')
        if app.homepage and app.homepage != "":  # type: ignore
            text.append('<a href="' + app.homepage + '" target="_blank" class="homepage"><span>Visit homepage</span></a>')  # type: ignore

        if app.repository and app.repository != "":  # type: ignore
            text.append('<a href="' + app.repository + '" target="_blank" class="github"><span>Open repository</span></a>')  # type: ignore

        text.append("</div>")
        text.append("</li>")

    text.append(
        """</ul> </nav> </main> <footer>
      <img src="assets/caleydo_c.svg" alt="Caleydo" width="20" height="20">
      <a href="http://caleydo.org">caleydo.org</a> </footer></div>
      <script src="assets/list.min.js"></script><script src="assets/main.js"></script>
      </body></html>
    """
    )
    return "\n".join(text)


def build_info():
    from codecs import open

    from .. import manager

    dependencies = []
    all_plugins = []
    build_info = dict(plugins=all_plugins, dependencies=dependencies)

    requirements = "requirements.txt"
    if os.path.exists(requirements):
        with open(requirements, "r", encoding="utf-8") as f:
            dependencies.extend([line.strip() for line in f.readlines()])

    for p in manager.registry.plugins:
        if p.id == "tdp_core":
            build_info["name"] = p.name  # type: ignore
            build_info["version"] = p.version  # type: ignore
            build_info["resolved"] = p.resolved  # type: ignore
        else:
            desc = dict(name=p.name, version=p.version, resolved=p.resolved)
            all_plugins.append(desc)

    return build_info


# health check for docker-compose, kubernetes
async def health():
    return "ok"


def create():
    # check initialization
    app = Flask(__name__)
    if manager.settings.is_development_mode:
        app.add_url_rule("/", "index", _generate_index)
        app.add_url_rule("/index.html", "index", _generate_index)
        app.add_url_rule("/<path:path>", "deliver", _deliver)
    else:
        app.add_url_rule("/<path:path>", "deliver", _deliver_production)
    return app
