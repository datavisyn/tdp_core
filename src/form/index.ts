/**
 * Created by Holger Stitz on 11.08.2016.
 */

export {default as FormBuilder} from './FormBuilder';
export {FormElementType, IFormElementDesc, IFormElement} from './interfaces';
export {IFormInputTextDesc} from './internal/FormInputText';
export {IFormSelectOption, IFormSelectDesc, IFormSelectOptions, IFormSelectOptionGroup, IFormSelectElement} from './internal/FormSelect';
export {IFormSelect2, ISelect2Option} from './internal/FormSelect2';
export {IFormMapDesc, convertRow2MultiMap, IFormMultiMap, IFormRow} from './internal/FormMap';
export {IButtonElementDesc} from './internal/FormButton';
export {default as FormDialog} from './FormDialog';
export {nameLookupDesc} from './internal/builder';

// name of the phovea extension type for all form elements
export const FORM_EXTENSION_POINT = 'tdpFormElement';
