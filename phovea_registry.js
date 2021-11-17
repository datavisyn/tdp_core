/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import {PluginRegistry} from './dist/app';
import reg from './dist/phovea';
/**
 * build a registry by registering all phovea modules
 */
//self
PluginRegistry.getInstance().register('tdp_core', reg);
