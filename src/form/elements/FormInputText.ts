/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import AFormElement from './AFormElement';
import {IFormElementDesc, IForm} from '../interfaces';
import {IPluginDesc} from 'phovea_core/src/plugin';


/**
 * Add specific options for input form elements
 */
export interface IFormInputTextDesc extends IFormElementDesc {
  /**
   * Additional options
   */
  options?: {
    /**
     * input field type: text, number, email, ...
     * @default text
     */
    type?: string;

    /**
     * Step size for input type `number`
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step
     */
    step?: string;
  };
}

export default class FormInputText extends AFormElement<IFormInputTextDesc> {

  private input: HTMLInputElement;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param parentElement The parent node this element will be attached to
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, parentElement: HTMLElement, elementDesc: IFormInputTextDesc, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);

    this.node = parentElement.ownerDocument.createElement('div');
    this.node.classList.add('form-group');
    parentElement.appendChild(this.node);

    this.build();
  }

  /**
   * Build the label and input element
   */
  protected build() {
    super.build();

    this.input = this.node.ownerDocument.createElement('input');
    this.input.setAttribute('type', (this.elementDesc.options || {}).type || 'text');
    this.node.appendChild(this.input);

    this.setAttributes(this.input, this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    if((this.elementDesc.options || {}).type === 'number' && (this.elementDesc.options || {}).step) {
      this.$input.attr('step', this.elementDesc.options.step);
    }

    const defaultValue = (this.elementDesc.options || {}).type === 'number' ? '0' : '';
    const defaultText = this.getStoredValue(defaultValue);
    this.previousValue = defaultText;
    this.input.value = defaultText;
    if (this.hasStoredValue()) {
      this.fire(FormInputText.EVENT_INITIAL_VALUE, defaultText, defaultValue);
    }

    this.handleDependent();

    // propagate change action with the data of the selected option
    this.input.addEventListener('change.propagate', () => {
      this.fire(FormInputText.EVENT_CHANGE, this.value, this.input);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    return this.input.value;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: string) {
    this.input.value = v;
    this.previousValue = v; // force old value change
    this.updateStoredValue();
  }

  focus() {
    this.input.focus();
  }
}
