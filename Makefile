.DEFAULT_GOAL := help
pkg_src = $(shell pwd)

flake8 = flake8 $(pkg_src)
isort = isort $(pkg_src)
black = black --line-length 140 $(pkg_src)

.PHONY: all  ## Perform the most common development-time rules
all: format lint test

.PHONY: ci  ## Run all CI validation steps without making any changes to code
ci: check-format lint test

.PHONY: format  ## Auto-format the source code
format:
	$(isort)
	$(black)

.PHONY: check-format  ## Check the source code format without changes
check-format:
	$(isort) --check-only
	$(black) --check

.PHONY: lint  ## Run flake8
lint:
	$(flake8)

.PHONY: test  ## Run tests
test:
	pytest $(pkg_src)

.PHONEY: sphinx ## Generate API docs using sphinx
sphinx: 
	sphinx-apidoc -o docs -f ./$(pkg_src) && sphinx-build ./docs build/docs

.PHONY: install  ## Install the requirements
install:
	pip install -e .

.PHONY: develop  ## Set up the development environment
develop:
	pip install -e .[develop]

.PHONY: build  ## Build a wheel
build:
	python setup.py sdist bdist_wheel

.PHONY: publish  ## Publish the ./dist/* using twine
publish:
	pip install twine==3.8.0
	twine upload --repository-url https://upload.pypi.org/legacy/ dist/*

.PHONY: help  ## Display this message
help:
	@grep -E \
		'^.PHONY: .*?## .*$$' $(MAKEFILE_LIST) | \
		sort | \
		awk 'BEGIN {FS = ".PHONY: |## "}; {printf "\033[36m%-20s\033[0m %s\n", $$2, $$3}'
