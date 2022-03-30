# Main command entrypoint of tdp_core, can be used to execute arbitrary commands via `python -m tdp_core.cmd <arg1> <arg2>`
import sys

from ..server.visyn_server import create_visyn_server

create_visyn_server(start_cmd=" ".join(sys.argv[1:]))
