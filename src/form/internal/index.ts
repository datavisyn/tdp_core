/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import {IForm, IFormElementDesc,IFormElement} from '../interfaces';
import {list, IPluginDesc} from 'phovea_core/src/plugin';
import {FORM_EXTENSION_POINT} from '..';

/**
 * Factory method to create form elements for the phovea extension type `tdpFormElement`.
 * An element is found when `desc.type` is matching the extension id.
 *
 * @param form the form to which the element will be appended
 * @param parentElement parent DOM element
 * @param desc form element description
 */
export function create(form: IForm, parentElement: HTMLElement, desc: IFormElementDesc): Promise<IFormElement> {
  const plugins = list((pluginDesc: IPluginDesc) => {
    return pluginDesc.type === FORM_EXTENSION_POINT && pluginDesc.id === desc.type;
  });
  if(plugins.length === 0) {
    throw new Error('unknown form element type: ' + desc.type);
  }
  return plugins[0].load().then((p) => {
    // selection is used in SELECT2 and SELECT3
    if(p.desc.selection) {
      return p.factory(form, parentElement, <any>desc, p.desc.selection);
    }
    return p.factory(form, parentElement, <any>desc);
  });
}
