import {IFormElementDesc, IForm} from '../interfaces';
import {AFormElement} from './AFormElement';
import {IPluginDesc} from 'phovea_core';

export interface ICheckBoxElementDesc extends IFormElementDesc {
  options: {
    /**
     * checked value
     */
    checked?: any;
    /**
     * unchecked value
     */
    unchecked?: any;
    /**
     * default value
     */
    isChecked?: any;
  };
}

export class FormCheckBox extends AFormElement<ICheckBoxElementDesc> {

  private inputElement: HTMLInputElement;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param parentElement The parent node this element will be attached to
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, parentElement: HTMLElement, elementDesc: ICheckBoxElementDesc, readonly pluginDesc: IPluginDesc) {
    super(form, Object.assign({options: { checked: true, unchecked: false}}, elementDesc), pluginDesc);

    this.node = parentElement.ownerDocument.createElement('div');
    this.node.classList.add('checkbox');
    parentElement.appendChild(this.node);

    this.build();
  }

  /**
   * Build the label and input element
   */
  protected build() {
    super.build();
    const label = this.node.querySelector('label');
    if (label) {
      label.innerHTML = `<input type="checkbox">${label.innerText}`;
      this.inputElement = label.querySelector('input');
    } else {
      this.inputElement = this.node.ownerDocument.createElement('input');
      this.inputElement.setAttribute('type', 'checkbox');
      this.node.appendChild(this.inputElement);
    }
    this.setAttributes(this.inputElement, this.elementDesc.attributes);
    this.inputElement.classList.remove('form-control'); // remove falsy class again
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    const options = this.elementDesc.options;
    const isChecked: boolean = options.isChecked != null? options.isChecked : this.getStoredValue(options.unchecked) === options.checked;
    this.previousValue = isChecked;
    this.inputElement.checked = isChecked;
    if (this.hasStoredValue()) { // trigger if we have a stored value
      // TODO: using the new value `isChecked` may be wrong, because it's of type boolean and options.checked and options.unchecked could be anything --> this.getStoredValue(...) should probably be used instead
      this.fire(FormCheckBox.EVENT_INITIAL_VALUE, isChecked, options.unchecked); // store initial values as actions with results in the provenance graph
    }

    this.handleDependent();

    // propagate change action with the data of the selected option
    this.inputElement.addEventListener('change.propagate', () => {
      this.fire(FormCheckBox.EVENT_CHANGE, this.value, this.inputElement);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    const options = this.elementDesc.options;
    return this.inputElement.checked ? options.checked : options.unchecked;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: any) {
    const options = this.elementDesc.options;
    this.inputElement.value = (v === options.checked).toString();
    this.previousValue = v === options.checked; // force old value change
    this.updateStoredValue();
  }

  focus() {
    this.inputElement.focus();
  }
}
