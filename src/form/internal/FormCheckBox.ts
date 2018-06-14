import {IFormElementDesc, IFormParent} from '../interfaces';
import * as d3 from 'd3';
import {AFormElement} from './AFormElement';

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
  };
}

export default class FormCheckBox extends AFormElement<ICheckBoxElementDesc> {

  private $input: d3.Selection<any>;

  /**
   * Constructor
   * @param parent
   * @param $parent
   * @param desc
   */
  constructor(parent: IFormParent, $parent: d3.Selection<any>, desc: ICheckBoxElementDesc) {
    super(parent, Object.assign({options: { checked: true, unchecked: false}}, desc));

    this.$node = $parent.append('div').classed('checkbox', true);

    this.build();
  }

  /**
   * Build the label and input element
   * Bind the change listener and propagate the selection by firing a change event
   */
  protected build() {
    super.build();
    const $label = this.$node.select('label');
    if ($label.empty()) {
      this.$input = this.$node.append('input').attr('type', 'checkbox');
    } else {
      this.$input = $label.html(`<input type="checkbox">${$label.text()}`).select('input');
    }
    this.setAttributes(this.$input, this.desc.attributes);
    this.$input.classed('form-control', false); //remove falsy class again

    const options = this.desc.options;
    const defaultValue = this.getStoredValue(options.unchecked) === options.checked;
    this.previousValue = defaultValue;
    this.$input.property('checked', defaultValue);
    if (defaultValue !== options.unchecked) {
      this.fire(FormCheckBox.EVENT_INITIAL_VALUE, defaultValue, options.unchecked);
    }

    this.handleDependent();

    // propagate change action with the data of the selected option
    this.$input.on('change.propagate', () => {
      this.fire(FormCheckBox.EVENT_CHANGE, this.value, this.$input);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    const options = this.desc.options;
    return this.$input.property('checked') ? options.checked: options.unchecked;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: any) {
    const options = this.desc.options;
    this.$input.property('value', v === options.checked);
    this.previousValue = v === options.checked; // force old value change
  }

  focus() {
    (<HTMLInputElement>this.$input.node()).focus();
  }
}
