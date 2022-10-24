tdp_core  
=====================
[![Target Discovery Platform][tdp-image-client]][tdp-url] [![Target Discovery Platform][tdp-image-server]][tdp-url] [![NPM version][npm-image]][npm-url] [![Build Status][circleci-image]][circleci-url]


Target discovery platform for exploring rankings of genes, disease models, and other entities.

Installation
------------

```bash
git clone -b develop https://github.com/datavisyn/tdp_core.git  # or any other branch you want to develop in
cd tdp_core

# Frontend
yarn install

# Backend
python3 -m venv .venv  # create a new virtual environment
source .venv/bin/activate  # active it
make develop  # install all dependencies
```

Local development
------------

```bash
# Frontend
yarn start

# Backend
python tdp_core
```

Testing
-------

```bash
# Frontend
yarn run test

# Backend
make test
```

Building
--------

```
yarn run build
```



***

<a href="https://www.datavisyn.io"><img src="https://www.datavisyn.io/img/logos/datavisyn-logo.png" align="left" width="200px" hspace="10" vspace="6"></a>
This repository is part of the **Target Discovery Platform** (TDP). For tutorials, API docs, and more information about the build and deployment process, see the [documentation page](https://wiki.datavisyn.io).




[tdp-image-client]: https://img.shields.io/badge/Target%20Discovery%20Platform-Client%20Plugin-F47D20.svg
[tdp-image-server]: https://img.shields.io/badge/Target%20Discovery%20Platform-Server%20Plugin-10ACDF.svg
[tdp-url]: http://datavisyn.io
[npm-image]: https://badge.fury.io/js/tdp_core.svg
[npm-url]: https://npmjs.org/package/tdp_core
[circleci-image]: https://circleci.com/gh/datavisyn/tdp_core.svg?style=shield
[circleci-url]: https://circleci.com/gh/datavisyn/tdp_core
