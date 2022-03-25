###############################################################################
# Caleydo - Visualization for Molecular Biology - http://caleydo.org
# Copyright (c) The Caleydo Team. All rights reserved.
# Licensed under the new BSD license, available at http://caleydo.org/license
###############################################################################

from setuptools import setup, find_packages
from codecs import open
from os import path
import json
from setuptools.command.develop import develop

here = path.abspath(path.dirname(__file__))


def read_it(name):
    with open(path.join(here, name), encoding='utf-8') as f:
        return f.read()


def requirements(file):
    return [r.strip() for r in read_it(file).strip().split('\n')]


class DevelopCommand(develop):
    user_options = develop.user_options + [
        ('workspace-repos=', None, 'Space separated list of directories in the workspace. Will be stripped from the loaded requirements. Example: "./tdp_core ./another_repo"'),
    ]

    def initialize_options(self):
        develop.initialize_options(self)
        self.workspace_repos = ''

    def run(self):
        # Extract the workspace repos by converting "./tdp_core ./another_repo" to ("tdp_core@", "another_repo@")
        workspace_repos = tuple(filter(None, (path.basename(s) + "@" for s in self.workspace_repos.split(' '))))
        if workspace_repos:
            # If any dependency starts with these workspace dependency names, do not install them.
            self.distribution.install_requires = [s for s in self.distribution.install_requires if not s.startswith(workspace_repos)]
            self.distribution.install_requires.extend(self.distribution.extras_require['develop'])
        develop.run(self)


pkg = json.loads(read_it('package.json'))


setup(
  name=pkg['name'].lower(),
  version=pkg['version'].replace('-SNAPSHOT', '.dev0'),
  url=pkg['homepage'],
  description=pkg['description'],
  long_description=read_it('README.md'),
  long_description_content_type='text/markdown',
  keywords=pkg.get('keywords', ''),
  author=pkg['author']['name'],
  author_email=pkg['author']['email'],
  license=pkg['license'],
  zip_safe=False,

  entry_points={
    'visyn.plugin': ['{0} = {0}:VisynPlugin'.format(pkg['name'])],
  },

  cmdclass={
      'develop': DevelopCommand,
  },

  # See https://pypi.python.org/pypi?%3Aaction=list_classifiers
  classifiers=[
    'Intended Audience :: Developers',
    'Operating System :: OS Independent',
    # Pick your license as you wish (should match "license" above)
    'License :: OSI Approved :: ' + ('BSD License' if pkg['license'] == 'BSD-3-Clause' else pkg['license']),
    'Programming Language :: Python',
    'Programming Language :: Python :: 3.10'
  ],

  # You can just specify the packages manually here if your project is
  # simple. Or you can use find_packages().
  packages=find_packages(exclude=['docs', 'tests*']),

  # List run-time dependencies here.  These will be installed by pip when
  # your project is installed. For an analysis of "install_requires" vs pip's
  # requirements files see:
  # https://packaging.python.org/en/latest/requirements.html
  install_requires=requirements('requirements.txt'),
  extras_require={
    'develop': requirements('requirements_dev.txt'),
  },

  # If there are data files included in your packages that need to be
  # installed, specify them here.  If using Python 2.6 or less, then these
  # have to be included in MANIFEST.in as well.
  package_data={
    pkg['name']: []
  },

  # Although 'package_data' is the preferred approach, in some case you may
  # need to place data files outside of your packages. See:
  # http://docs.python.org/3.4/distutils/setupscript.html#installing-additional-files # noqa
  # In this case, 'data_file' will be installed into '<sys.prefix>/my_data'
  data_files=[]  # [('my_data', ['data/data_file'])],
)
