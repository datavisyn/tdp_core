import * as d3v3 from 'd3v3';
import { IPluginDesc } from 'visyn_core';
import { AFormElement } from './AFormElement';
import { IFormElementDesc, IForm, FormElementType } from '../interfaces';

/**
 * Add specific options for input form elements
 */
export interface IFormInputTextDesc extends IFormElementDesc {
  type: FormElementType.INPUT_TEXT;
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
  } & IFormElementDesc['options'];
}

export class FormInputText extends AFormElement<IFormInputTextDesc> {
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
  build($formNode: d3v3.Selection<any>) {
    this.addChangeListener();

    this.$rootNode = $formNode.append('div');
    this.setVisible(this.elementDesc.visible);
    this.appendLabel(this.$rootNode);

    this.$inputNode = this.$rootNode
      .append('input')
      .classed('form-control', true)
      .attr('type', (this.elementDesc.options || {}).type || 'text');
    this.setAttributes(this.$inputNode, this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    if ((this.elementDesc.options || {}).type === 'number' && (this.elementDesc.options || {}).step) {
      this.$inputNode.attr('step', this.elementDesc.options.step);
    }

    const defaultValue = (this.elementDesc.options || {}).type === 'number' ? '0' : '';
    const defaultText = this.getStoredValue(defaultValue);
    this.previousValue = defaultText;
    this.$inputNode.property('value', defaultText);
    if (this.hasStoredValue()) {
      this.fire(FormInputText.EVENT_INITIAL_VALUE, defaultText, defaultValue);
    }

    this.handleDependent();

    // propagate change action with the data of the selected option
    this.$inputNode.on('change.propagate', () => {
      this.fire(FormInputText.EVENT_CHANGE, this.value, this.$inputNode);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    return this.$inputNode.property('value');
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: string) {
    this.$inputNode.property('value', v);
    this.previousValue = v; // force old value change
    this.updateStoredValue();
  }

  focus() {
    (<HTMLInputElement>this.$inputNode.node()).focus();
  }
}
