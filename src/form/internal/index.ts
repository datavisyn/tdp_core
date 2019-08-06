/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import {IFormParent, IFormElementDesc, FormElementType} from '../interfaces';
import FormSelect from './FormSelect';
import FormSelect2 from './FormSelect2';
import FormInputText from './FormInputText';
import FormMap from './FormMap';
import FormButton from './FormButton';
import FormCheckBox from './FormCheckBox';
import FormSelect3 from './FormSelect3';
import FormRadio from './FormRadio';
import {list, IPluginDesc} from 'phovea_core/src/plugin';

export function create(parent: IFormParent, $parent: d3.Selection<any>, desc: IFormElementDesc) {
  switch (desc.type) {
    case FormElementType.SELECT:
      return Promise.resolve(new FormSelect(parent, $parent, desc));
    case FormElementType.SELECT2:
      return Promise.resolve(new FormSelect2(parent, $parent, desc));
    case FormElementType.SELECT2_MULTIPLE:
      return Promise.resolve(new FormSelect2(parent, $parent, desc, 'multiple'));
    case FormElementType.SELECT3:
      return Promise.resolve(new FormSelect3(parent, $parent, desc));
    case FormElementType.SELECT3_MULTIPLE:
      return Promise.resolve(new FormSelect3(parent, $parent, desc, 'multiple'));
    case FormElementType.INPUT_TEXT:
      return Promise.resolve(new FormInputText(parent, $parent, desc));
    case FormElementType.MAP:
      return Promise.resolve(new FormMap(parent, $parent, <any>desc));
    case FormElementType.BUTTON:
      return Promise.resolve(new FormButton(parent, $parent, <any>desc));
    case FormElementType.CHECKBOX:
      return Promise.resolve(new FormCheckBox(parent, $parent, <any>desc));
    case FormElementType.RADIO:
      return Promise.resolve(new FormRadio(parent, $parent, <any>desc));
    default:
      const plugins = list((pluginDesc: IPluginDesc) => pluginDesc.type === 'tdpFormElement' && pluginDesc.id === desc.type);
      if(plugins.length === 0) {
        throw new Error('unknown form element type: ' + desc.type);
      }
      return plugins[0].load().then((p) => p.factory(parent, $parent, <any>desc));
  }
}
