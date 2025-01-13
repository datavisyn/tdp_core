/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
import $ from 'jquery';
// @ts-ignore
import select2 from 'select2';
import { PluginRegistry } from 'visyn_core/plugin';

import reg from './phovea';
/**
 * build a registry by registering all phovea modules
 */
// other modules
import 'visyn_core/phovea_registry';

select2(window, $);

// self
PluginRegistry.getInstance().register('tdp_core', reg);
