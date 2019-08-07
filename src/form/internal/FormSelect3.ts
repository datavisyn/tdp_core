/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import AFormElement from './AFormElement';
import {IForm} from '../interfaces';
import {IFormSelectDesc} from './FormSelect';
import Select3, {IdTextPair, ISelect3Item, ISelect3Options} from './Select3';
import {ISelect2Option} from './FormSelect2';

declare type IFormSelect3Options = Partial<ISelect3Options<ISelect2Option>> & {
  return?: 'text' | 'id';
  data?: ISelect2Option[] | ((dependents: any) => ISelect2Option[]);
};

/**
 * Add specific options for select form elements
 */
export interface IFormSelect3 extends IFormSelectDesc {
  /**
   * Additional options
   */
  options?: IFormSelect3Options;
}

/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export default class FormSelect3 extends AFormElement<IFormSelect3> {

  private readonly multiple: boolean;

  private select3: Select3<IdTextPair>;

  /**
   * Constructor
   * @param form
   * @param parentElement
   * @param desc
   * @param multiple
   */
  constructor(form: IForm, parentElement: HTMLElement, desc: IFormSelect3, multiple: 'multiple' | 'single' = 'single') {
    super(form, desc);

    this.node = parentElement.ownerDocument.createElement('div');
    this.node.classList.add('form-group');
    parentElement.appendChild(this.node);

    this.multiple = multiple === 'multiple';

    this.build();
  }

  /**
   * Build the label and select element
   */
  protected build() {
    super.build();

    const options = Object.assign(this.desc.options, {multiple: this.multiple});
    this.select3 = new Select3(options);
    this.node.appendChild(this.select3.node);

    this.desc.attributes.clazz = this.desc.attributes.clazz.replace('form-control', ''); // filter out the form-control class, because the border it creates doesn't contain the whole element due to absolute positioning and it isn't necessary
    this.setAttributes(this.node.querySelector('.select3'), this.desc.attributes);

  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  initialize() {
    super.initialize();

    this.select3.on(Select3.EVENT_SELECT, (evt, prev: IdTextPair[], next: IdTextPair[]) => {
      this.fire(FormSelect3.EVENT_CHANGE, next);
    });
  }

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {ISelect3Item<IdTextPair> | string | (ISelect3Item<IdTextPair> | string)[]}
   */
  get value(): (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[] {
    const returnValue = this.desc.options.return;
    const returnFn = returnValue === 'id' ? (d) => d.id : (returnValue === 'text' ? (d) => d.text : (d) => d);
    const value = <IdTextPair[]>this.select3.value;

    if (!value || value.length === 0) {
      return this.multiple ? [] : returnFn({id: '', text: ''});
    }
    const data = value.map((d) => ({id: d.id, text: d.text})).map(returnFn);
    return this.multiple ? data : data[0];
  }

  hasValue() {
    return this.select3.value.length > 0;
  }

  /**
   * Select the option by value. If no value found, then the first option is selected.
   * @param v If string then compares to the option value property. Otherwise compares the object reference.
   */
  set value(v: (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[]) {
    const toIdTextPair = (d) => {
      if (typeof d === 'string') {
        return {id: d, text: d};
      } else {
        return {
          id: d.id ? d.id : d.text,
          text: d.text ? d.text : d.id
        };
      }
    };

    if (!v) {
      this.select3.value = this.previousValue = [];
      this.updateStoredValue();
      return;
    }

    this.previousValue = this.select3.value;
    if (Array.isArray(v) && v.length > 0 && !this.multiple) { // an array of items or string (id or text)
      this.select3.value = v.slice(0, 1).map(toIdTextPair);
    } else if (Array.isArray(v) && v.length > 0 && this.multiple) {
      this.select3.value = v.map(toIdTextPair);
    } else if (!Array.isArray(v)) { // an item or string (id or text)
      this.select3.value = [toIdTextPair(v)];
    }
    this.updateStoredValue();
  }

  focus() {
    this.select3.focus();
  }
}
