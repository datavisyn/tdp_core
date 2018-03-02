/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import AFormElement from './AFormElement';
import {IFormParent} from '../interfaces';
import {IFormSelectDesc} from './FormSelect';
import Select3, {ISelect3Item} from './Select3';
import {ISelect2Option} from './FormSelect2';

declare type IFormSelect3Options = Select2Options & {
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
   * @param parent
   * @param $parent
   * @param desc
   * @param multiple
   */
  constructor(parent: IFormParent, $parent, desc: IFormSelect3, multiple: 'multiple' | 'single' = 'single') {
    super(parent, desc);

    this.$node = $parent.append('div').classed('form-group', true);
    this.multiple = multiple === 'multiple';

    this.build();
  }

  /**
   * Build the label and select element
   * Bind the change listener and propagate the selection by firing a change event
   */
  protected build() {
    super.build();

    const options = Object.assign(this.desc.options, {multiple: this.multiple});
    this.select3 = new Select3(options);
    this.$node.node().appendChild(this.select3.node);
    this.select3.on(Select3.EVENT_SELECT, (evt, prev: IdTextPair[], next: IdTextPair[]) => {
      this.fire(FormSelect3.EVENT_CHANGE, next);
    })
  }

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {string|{name: string, value: string, data: any}|null}
   */
  get value(): (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[] {
    // Views listen to change values of type string arrays, so map Array of IdTextPair to Array of string ids
    return (<IdTextPair[]>this.select3.value).map((v) => v.id);
  }

  hasValue() {
    const v = this.value;
    if (this.multiple) {
      return (<IdTextPair[]>v).length > 0;
    } else {
      return v !== '' || (<any>v).id !== '';
    }
  }

  /**
   * Select the option by value. If no value found, then the first option is selected.
   * @param v If string then compares to the option value property. Otherwise compares the object reference.
   */
  set value(v: (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[]) {
    this.select3.value = <any>v;
  }

  focus() {
  }

}
