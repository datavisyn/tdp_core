/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import {IForm, IFormElementDesc,IFormElement} from '../interfaces';
import {get} from 'phovea_core/src/plugin';
import {EP_TDP_CORE_FORM_ELEMENT} from '../../extensions';

/**
 * Factory method to create form elements for the phovea extension type `tdpFormElement`.
 * An element is found when `desc.type` is matching the extension id.
 *
 * @param form the form to which the element will be appended
 * @param $parent parent D3 selection element
 * @param elementDesc form element description
 */
export function create(form: IForm, elementDesc: IFormElementDesc): Promise<IFormElement> {
  const plugin = get(EP_TDP_CORE_FORM_ELEMENT, elementDesc.type);
  if(!plugin) {
    throw new Error('unknown form element type: ' + elementDesc.type);
  }
  return plugin.load().then((p) => {
    return p.factory(form, <any>elementDesc, p.desc);
  });
}
