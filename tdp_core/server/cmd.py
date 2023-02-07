import logging
import shlex
from typing import Callable

from .. import manager

_log = logging.getLogger(__name__)


def parse_command_string(cmd: str | None) -> Callable | None:
    """
    Parses an application command.
    Example using cmd entrypoint:
    ```
    python -m tdp_core.cmd db-migration list
    ```
    The last argument (e.g., `db-migration`) is the command that must be registered as extension in the __init__.py and points to an execution file.
    Example:
    ```py
    registry.append('command', 'db-migration', 'tdp_core.dbmigration.manager', {})
    ```
    The example registers the db-migration command that runs the `create()` factory method from the tdp_core.dbmigration.manager.py.
    """
    # If we receive no command, just return None
    if not cmd:
        return None

    import argparse

    parser = argparse.ArgumentParser(description="Visyn Server")

    # create a subparser, with the first argument being the command id
    subparsers = parser.add_subparsers(dest="cmd")

    for command in manager.registry.list("command"):
        _log.info(f"Received an alternative starting command: {command.id}")

        # create a argument parser for this specific command
        cmdparser = subparsers.add_parser(command.id)

        # use the phovea extension point loading mechanism.
        # pass the parser as argument to the factory method so that the extension point (i.e., command)
        # can add further arguments to the parser (e.g., the address or port of the server).
        # the factory must return a launcher function, which gets the previously defined parser arguments as parameter.
        instance = command.load().factory(cmdparser)

        # register the instance as argument `launcher` and the command as `launcherid` to the command parser
        cmdparser.set_defaults(launcher=instance, launcherid=command.id)

    # Parse the arguments from the start command to an array
    args = parser.parse_args(shlex.split(cmd))

    # Call the launcher function, which returns another function
    return args.launcher(args)
