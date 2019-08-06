/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import {IFormParent, IFormElementDesc,IFormElement} from '../interfaces';
import {list, IPluginDesc} from 'phovea_core/src/plugin';
import {FORM_EXTENSION_POINT} from '..';

/**
 * Factory method to create form elements for the phovea extension type `tdpFormElement`.
 * An element is found when `desc.type` is matching the extension id.
 *
 * @param parent parent form element
 * @param $parent parent D3 selection element
 * @param desc form element description
 */
export function create(parent: IFormParent, $parent: d3.Selection<any>, desc: IFormElementDesc): Promise<IFormElement> {
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
