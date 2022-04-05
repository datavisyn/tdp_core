# TODO: Development Introduction

All important scripts are exposed via the Makefile. Use `make help` to show all available commands. 

## Formatting

Use `make format` to reformat all corresponding files.

## Linting

Use `make lint` to check for linting issues.

## Testing

Use `make test` to run the available test-suites using pytest.

## Writing documentation

[mkdocs-material](https://squidfunk.github.io/mkdocs-material/) is used to write this documentation.

### Commands

* `mkdocs new [dir-name]` - Create a new project.
* `mkdocs serve` - Start the live-reloading docs server.
* `mkdocs build` - Build the documentation site.
* `mkdocs -h` - Print help message and exit.

### Project layout

    mkdocs.yml    # The configuration file.
    docs/
        index.md  # The documentation homepage.
        ...       # Other markdown pages, images and other files.
