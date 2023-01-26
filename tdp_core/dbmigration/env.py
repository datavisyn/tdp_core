from alembic import context
from sqlalchemy import engine_from_config, pool

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
# fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = None


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # The other configuration is fetched in the actual migration function,
    # because this env.py file is imported only once.
    # When having multiple migrations, the config is edited inline,
    # such that always the most-up-to-date configuration can be loaded in the actual function call.
    migration_id = config.get_main_option("migration_id")
    if not migration_id:
        raise ValueError("No migration_id in main configuration")

    # Additional configuration to be passed to context.configure
    additional_configuration = {}
    # Add the version_table_schema parameter if it exists
    version_table_schema = config.get_main_option("version_table_schema")
    if version_table_schema:
        additional_configuration["version_table_schema"] = version_table_schema

    connectable = engine_from_config(
        config.get_section(config.config_ini_section),  # type: ignore
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_schemas=True,
            version_table=f"{migration_id}_alembic_version",
            **additional_configuration,
        )

        with context.begin_transaction():
            context.run_migrations()
