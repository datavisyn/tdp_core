default_logging_dict = {
    "version": 1,
    # "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "%(asctime)s %(levelname)s %(name)s: %(message)s",
            "datefmt": "%H:%M:%S",
        },
        "line": {"format": "%(asctime)s %(levelname)s %(name)s(%(pathname)s:%(lineno)s): %(message)s"},
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "stream": "ext://sys.stdout",
        }
    },
    "root": {"level": "INFO", "handlers": ["console"]},
}
