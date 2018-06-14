import {IFormElementDesc, IFormParent} from '../interfaces';
import * as d3 from 'd3';
import {AFormElement} from './AFormElement';
import {IFormSelectOption} from './FormSelect';

export interface IRadioElementDesc extends IFormElementDesc {
  options: {
    buttons: IFormSelectOption[];
  };
}

export default class FormRadio extends AFormElement<IRadioElementDesc> {

  /**
   * Constructor
   * @param parent
   * @param $parent
   * @param desc
   */
  constructor(parent: IFormParent, $parent: d3.Selection<any>, desc: IRadioElementDesc) {
    super(parent, Object.assign({options: { buttons: [] }}, desc));

    this.$node = $parent.append('div');

    this.build();
  }

  /**
   * Build the label and input element
   * Bind the change listener and propagate the selection by firing a change event
   */
  protected build() {
    super.build();
    const $label = this.$node.select('label');

    const options = this.desc.options;
    // this.setAttributes(this.$input, this.desc.attributes);
    const $buttons = this.$node.selectAll('label.radio-inline').data(options.buttons);
    $buttons.enter().append('label').classed('radio-inline', true).html((d, i) => `<input type="radio" name="${this.id}" id="${this.id}${i === 0 ? '' : i}" value="${d.value}"> ${d.name}`);

    $buttons.select('input').on('change', (d) => {
      this.fire(FormRadio.EVENT_CHANGE, d, $buttons);
    });

    const defaultOption = options.buttons[0].data;
    const defaultValue = this.getStoredValue(defaultOption);
    this.value = defaultValue;
    this.previousValue = defaultValue;

    if (defaultValue !== defaultOption) {
      this.fire(FormRadio.EVENT_INITIAL_VALUE, this.value);
    }

    this.handleDependent();
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    const checked = this.$node.select('input:checked');
    return checked.empty() ? null : checked.datum().data;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: any) {
    this.$node.selectAll('input').property('checked', (d) => d === v || d.data === v);
    this.previousValue = v; // force old value change
  }

  focus() {
    (<HTMLInputElement>this.$node.select('input').node()).focus();
  }
}
