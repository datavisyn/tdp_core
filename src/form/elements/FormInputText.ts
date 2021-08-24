/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import * as d3 from 'd3';
import {AFormElement} from './AFormElement';
import {IFormElementDesc, IForm} from '../interfaces';
import {IPluginDesc} from 'phovea_core';


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

export class FormInputText extends AFormElement<IFormInputTextDesc> {

  private $input: d3.Selection<any>;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, elementDesc: IFormInputTextDesc, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);
  }

  /**
   * Build the label and input element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3.Selection<any>) {
    this.addChangeListener();

    this.$node = $formNode.append('div');
    this.setVisible(this.elementDesc.visible);
    this.appendLabel();

    this.$input = this.$node.append('input').classed('form-control', true).attr('type', (this.elementDesc.options || {}).type || 'text');
    this.setAttributes(this.$input, this.elementDesc.attributes);
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
    this.$input.property('value', defaultText);
    if (this.hasStoredValue()) {
      this.fire(FormInputText.EVENT_INITIAL_VALUE, defaultText, defaultValue);
    }

    this.handleDependent();

    // propagate change action with the data of the selected option
    this.$input.on('change.propagate', () => {
      this.fire(FormInputText.EVENT_CHANGE, this.value, this.$input);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    return this.$input.property('value');
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: string) {
    this.$input.property('value', v);
    this.previousValue = v; // force old value change
    this.updateStoredValue();
  }

  focus() {
    (<HTMLInputElement>this.$input.node()).focus();
  }
}
