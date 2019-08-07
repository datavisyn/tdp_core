import {IFormElementDesc, IForm} from '../interfaces';
import {select} from 'd3';
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
   * @param form
   * @param parentElement
   * @param desc
   */
  constructor(form: IForm, parentElement: HTMLElement, desc: IRadioElementDesc) {
    super(form, Object.assign({options: { buttons: [] }}, desc));

    this.node = parentElement.ownerDocument.createElement('div');
    parentElement.appendChild(this.node);

    this.build();
  }

  /**
   * Build the label and input element
   */
  protected build() {
    super.build();

    const options = this.desc.options;

    const $buttons = select(this.node).selectAll('label.radio-inline').data(options.buttons);
    $buttons.enter().append('label').classed('radio-inline', true).html((d, i) => `<input type="radio" name="${this.id}" id="${this.id}${i === 0 ? '' : i}" value="${d.value}"> ${d.name}`);

    const $buttonElements = $buttons.select('input');

    $buttonElements.on('change', (d) => {
      this.fire(FormRadio.EVENT_CHANGE, d, $buttons);
    });

    // TODO: fix that the form-control class is only appended for textual form elements, not for all
    this.desc.attributes.clazz = this.desc.attributes.clazz.replace('form-control', ''); // filter out the form-control class, because it is mainly used for text inputs and destroys the styling of the radio
    this.setAttributes(<HTMLElement>$buttonElements.node(), this.desc.attributes);

  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  initialize() {
    super.initialize();

    const options = this.desc.options;
    const defaultOption = options.buttons[0].data;
    const defaultValue = this.getStoredValue(defaultOption);
    this.value = defaultValue;
    this.previousValue = defaultValue;

    if (this.hasStoredValue()) {
      this.fire(FormRadio.EVENT_INITIAL_VALUE, this.value, defaultOption);
    }

    this.handleDependent();
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    const input = this.node.querySelector('input:checked');
    return input ? (<any>input).__data__.data : null;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: any) {
    Array.from(this.node.querySelectorAll('input')).forEach((input) => {
      input.checked = (<any>input).__data__ === v || (<any>input).__data__.data === v;
    });
    this.previousValue = v; // force old value change
    this.updateStoredValue();
  }

  focus() {
    this.node.querySelector('input').focus(); // querySelector = first input element
  }
}
