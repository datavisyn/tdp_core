/**
 * Created by Samuel Gratzl on 08.03.2017.
 */


import {IEventHandler} from 'phovea_core/src/event';

/**
 * List of all available for elements that the form builder can handle
 * @see FormBuilder.appendElement()
 */
export enum FormElementType {
  /**
   * shows a simple select box
   * @see IFormSelectDesc
   */
  SELECT,
    /**
     * shows a select box based on select2
     * @see IFormSelect2
     */
  SELECT2,
    /**
     * similar to SELECT2 but with multiple selections allowed
     */
  SELECT2_MULTIPLE,
    /**
     * SELECT2 with additional functionality such as validation, tokenize and file drag
     */
  SELECT3,
    /**
     * similar to SELECT3 but with multiple selections allowed
     */
  SELECT3_MULTIPLE,
    /**
     * a text field
     * @see IFormInputTextDesc
     */
  INPUT_TEXT,
    /**
     * a complex dynamic sub map form element
     * @see IFormMapDesc
     */
  MAP,
    /**
     * a simple button
     * @see IButtonElementDesc
     */
  BUTTON,
    /**
     * a checkbox
     * @see ICheckBoxElementDesc
     */
  CHECKBOX
}

/**
 * The description is used to build the form element
 */
export interface IFormElementDesc {
  /**
   * Choose a type which element should be created
   */
  type: FormElementType;

  /**
   * Unique identifier for each page
   */
  id: string;

  /**
   * Label for the form element
   */
  label?: string;

  /**
   * Show or hide form element
   */
  visible?: boolean;

  /**
   * is this field required
   */
  required?: boolean;

  /**
   * Attributes that are applied to the DOM element
   */
  attributes?: {
    /**
     * Note: Used `clazz` instead of the DOM property `class`, due to JS reserved keyword
     */
    clazz?: string,
    /**
     * Id attribute can be set independently from the `id` property above or will be copied if empty
     */
    id?: string,
    /**
     * Style attribute
     */
    style?: string
  };

  /**
   * Id of a different form element where an on change listener is attached to
   */
  dependsOn?: string[];

  /**
   *
   */
  showIf?: (dependantValue: any[]) => boolean;

  /**
   * Whether to store the value in a session or not
   */
  useSession?: boolean;

  /**
   * Form element specific options
   */
  options?: {};

  /**
   * hide label
   */
  hideLabel?: boolean;

  /**
   * generic on change handler
   * @param {IFormElement} formElement
   * @param value the current value
   * @param data the data associated with the the value, i.e. value.data || value
   * @param previousValue the previous value
   */
  onChange?: (formElement: IFormElement, value: any, data: any, previousValue: any)=>void;
}


export interface IFormParent {
  getElementById(id: string): IFormElement;
}

/**
 * Describes public properties of a form element instance
 */
export interface IFormElement extends IEventHandler {
  /**
   * Unique identifier of the element within the form
   */
  readonly id: string;

  /**
   * Form element value
   */
  value: any;

  /**
   * Set the visibility of an form element
   * @param visible
   */
  setVisible(visible: boolean): void;

  /**
   * validates this field
   */
  validate(): boolean;

  /**
   * sets the focus to the element (e.g. opens a dropdown, etc.)
   */
  focus(): void;
}
