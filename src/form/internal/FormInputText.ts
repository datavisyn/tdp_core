/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import * as d3 from 'd3';
import AFormElement from './AFormElement';
import {IFormElementDesc, IFormParent} from '../interfaces';


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
  };
}

export default class FormInputText extends AFormElement<IFormInputTextDesc> {

  private $input: d3.Selection<any>;

  /**
   * Constructor
   * @param parent
   * @param $parent
   * @param desc
   */
  constructor(parent: IFormParent, $parent, desc: IFormInputTextDesc) {
    super(parent, desc);

    this.$node = $parent.append('div').classed('form-group', true);

    this.build();
  }

  /**
   * Build the label and input element
   * Bind the change listener and propagate the selection by firing a change event
   */
  protected build() {
    super.build();
    this.$input = this.$node.append('input').attr('type', (this.desc.options || {}).type || 'text');
    this.setAttributes(this.$input, this.desc.attributes);

    const defaultValue = (this.desc.options || {}).type === 'number' ? '0' : '';
    const defaultText = this.getStoredValue(defaultValue);
    this.previousValue = defaultText;
    this.$input.property('value', defaultText);

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
  }

  focus() {
    (<HTMLInputElement>this.$input.node()).focus();
  }
}
