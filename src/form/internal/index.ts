/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import {IFormParent, IFormElementDesc} from '../interfaces';
import {list, IPluginDesc} from 'phovea_core/src/plugin';
import {FORM_EXTENSION_POINT} from '..';

export function create(parent: IFormParent, $parent: d3.Selection<any>, desc: IFormElementDesc) {
  const plugins = list((pluginDesc: IPluginDesc) => {
    return pluginDesc.type === FORM_EXTENSION_POINT && pluginDesc.id === desc.type;
  });
  if(plugins.length === 0) {
    throw new Error('unknown form element type: ' + desc.type);
  }
  return plugins[0].load().then((p) => {
    // selection is used in SELECT2 and SELECT3
    if(p.desc.selection) {
      return p.factory(parent, $parent, <any>desc, p.desc.selection);
    }
    return p.factory(parent, $parent, <any>desc);
  });
}
