from typing import Callable, Union
from ..plugin.registry import list_plugins
import logging
import shlex

_log = logging.getLogger(__name__)


def parse_command_string(cmd: Union[str, None]) -> Union[Callable, None]:
    """
    Parses an application command.
    Example using environment variables:
    ```
    START_CMD='dbmigration list' uvicorn ...
    ```
    The last argument (e.g., `dbmigration`) is the command that must be registered as extension in the __init__.py and points to an execution file.
    Example:
    ```py
    registry.append('command', 'dbmigration', 'tdp_core.dbmigration.manager', {})
    ```
    The example registers the dbmigration command that runs the `create()` factory method from the tdp_core.dbmigration.manager.py.
    """
    # If we receive no command, just return None
    if not cmd:
        return None

    import argparse

    parser = argparse.ArgumentParser(description='Visyn Server')

    # create a subparser, with the first argument being the command id
    subparsers = parser.add_subparsers(dest='cmd')

    for command in list_plugins('command'):
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
