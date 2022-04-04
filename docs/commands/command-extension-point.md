# `command` Extension Point

The `command` extension point supports adding custom commands which are executed within the server context, i.e. with loaded plugin registry, migrations, etc. These command override the default server startup and execute the command only. 

## Register a custom command

Registering custom commands is considered legacy and will not be discussed thoroughly. 

## Running a custom command

The python module `tdp_core.cmd` can be used as executable module to run any registered command. The corresponding call (executed in the same bash where the server is usually executed, i.e. docker if in dockerized environment) looks like this:

```bash
python -m tdp_core.cmd <cmd-id> <cmd-arg1> <cmd-arg2> <...>
```

More concretely, one can trigger a database upgrade using the following command:

```bash
python -m tdp_core.cmd db-migration <migration-id> upgrade head
```

And a complete downgrade using following command:

```bash
python -m tdp_core.cmd db-migration <migration-id> downgrade base
```

Please see the official alembic documentation regarding database migrations: [https://alembic.sqlalchemy.org/en/latest/api/commands.html](https://alembic.sqlalchemy.org/en/latest/api/commands.html).
