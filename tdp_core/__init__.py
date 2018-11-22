###############################################################################
# Caleydo - Visualization for Molecular Biology - http://caleydo.org
# Copyright (c) The Caleydo Team. All rights reserved.
# Licensed under the new BSD license, available at http://caleydo.org/license
###############################################################################


def phovea(registry):
  """
  register extension points
  :param registry:
  """
  # generator-phovea:begin
  registry.append('namespace', 'tdp_core', 'tdp_core.proxy',
                  {
                      'namespace': '/api/tdp/proxy'
                  })

  registry.append('namespace', 'db_connector', 'tdp_core.sql',
                  {
                      'namespace': '/api/tdp/db'
                  })

  registry.append('namespace', 'tdp_storage', 'tdp_core.storage',
                  {
                      'namespace': '/api/tdp/storage'
                  })
  registry.append('namespace', 'tdp_swagger', 'tdp_core.swagger',
                  {
                      'namespace': '/api/tdp/ui'
                  })
  registry.append('namespace', 'tdp_config', 'tdp_core.config',
                  {
                      'namespace': '/api/tdp/config'
                  })
  registry.append('namespace', 'tdp_xslx2json', 'tdp_core.xslx',
                  {
                      'namespace': '/api/tdp/xslx'
                  })
  registry.append('mapping_provider', 'tdp_core', 'tdp_core.mapping_table')
  registry.append('greenifier', 'psycopg2', 'tdp_core.sql_use_gevent', {})
  # generator-phovea:end
  pass


def phovea_config():
  """
  :return: file pointer to config file
  """
  from os import path
  here = path.abspath(path.dirname(__file__))
  config_file = path.join(here, 'config.json')
  return config_file if path.exists(config_file) else None
