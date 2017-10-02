/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import * as d3 from 'd3';
import * as session from 'phovea_core/src/session';
import AFormElement from './AFormElement';
import {IFormElementDesc, IFormParent, IFormElement} from '../interfaces';
import {resolveImmediately} from 'phovea_core/src';


export interface IFormSelectOption {
  name: string;
  value: string;
  data: any;
}

export declare type ISelectOptions = ((string|IFormSelectOption)[]|Promise<(string|IFormSelectOption)[]>);

export interface IFormSelectOptions {
  /**
   * Data for the options elements of the select
   */
  optionsData?: ISelectOptions|((dependents: any[]) => ISelectOptions);
  /**
   * Index of the selected option; this option overrides the selected index from the `useSession` property
   */
  selectedIndex?: number;
}

/**
 * Add specific options for select form elements
 */
export interface IFormSelectDesc extends IFormElementDesc {
  /**
   * Additional options
   */
  options?: IFormSelectOptions;
}

export interface IFormSelectElement extends IFormElement {
  getSelectedIndex(): number;

  updateOptionElements(data: (string|IFormSelectOption)[]): void;
}

/**
 * Select form element instance
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export default class FormSelect extends AFormElement<IFormSelectDesc> implements IFormSelectElement {

  private $select: d3.Selection<any>;

  /**
   * Constructor
   * @param parent
   * @param $parent
   * @param desc
   */
  constructor(parent: IFormParent, $parent: d3.Selection<any>, desc: IFormSelectDesc) {
    super(parent, desc);

    this.$node = $parent.append('div').classed('form-group', true);

    this.build();
  }

  protected updateStoredValue() {
    if (!this.desc.useSession) {
      return;
    }
    session.store(`${this.id}_selectedIndex`, this.getSelectedIndex());
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.desc.useSession) {
      return defaultValue;
    }
    return session.retrieve(`${this.id}_selectedIndex`, defaultValue);
  }

  /**
   * Build the label and select element
   * Bind the change listener and propagate the selection by firing a change event
   */
  protected build() {
    super.build();

    const options = this.desc.options;
    this.$select = this.$node.append('select');
    this.setAttributes(this.$select, this.desc.attributes);

    // propagate change action with the data of the selected option
    this.$select.on('change.propagate', () => {
      this.fire(FormSelect.EVENT_CHANGE, this.value, this.$select);
    });

    const data = resolveData(options.optionsData);

    const values = this.handleDependent((values) => {
      data(values).then((items) => {
        this.updateOptionElements(items);
        this.$select.property('selectedIndex', options.selectedIndex || 0);
        this.fire(FormSelect.EVENT_CHANGE, this.value, this.$select);
      });
    });

    const defaultSelectedIndex = this.getStoredValue(0);

    data(values).then((items) => {
      this.updateOptionElements(items);
      const index = options.selectedIndex !== undefined ? options.selectedIndex : defaultSelectedIndex;
      this.previousValue = items[index];
      this.$select.property('selectedIndex', index);
    });
  }

  /**
   * Returns the selectedIndex. If the option `useSession` is enabled,
   * the index from the session will be used as fallback
   */
  getSelectedIndex(): number {
    const defaultSelectedIndex = this.getStoredValue(0);
    const currentSelectedIndex = <number>this.$select.property('selectedIndex');
    return (currentSelectedIndex === -1) ? defaultSelectedIndex : currentSelectedIndex;
  }

  /**
   * Update the options of a select form element using the given data array
   * @param data
   */
  updateOptionElements(data: (string|IFormSelectOption)[]) {
    const options = data.map(toOption);

    const $options = this.$select.selectAll('option').data(options);
    $options.enter().append('option');

    $options.attr('value', (d) => d.value).html((d) => d.name);

    $options.exit().remove();
  }

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {string|{name: string, value: string, data: any}|null}
   */
  get value() {
    const option = d3.select((<HTMLSelectElement>this.$select.node()).selectedOptions[0]);
    return (option.size() > 0) ? option.datum() : null;
  }

  /**
   * Select the option by value. If no value found, then the first option is selected.
   * @param v If string then compares to the option value property. Otherwise compares the object reference.
   */
  set value(v: any) {
    // if value is undefined or null, set to first index
    if (!v) {
      this.$select.property('selectedIndex', 0);
      this.previousValue = null;
      return;
    }

    this.$select.selectAll('option').data().forEach((d, i) => {
      if ((v.value && d.value === v.value) || d.value === v || d === v) {
        this.$select.property('selectedIndex', i);
        this.previousValue = d; // force value update
      }
    });
  }

  hasValue() {
    return this.value !== null;
  }

  focus() {
    (<HTMLSelectElement>this.$select.node()).focus();
  }
}

function toOption(d: string|IFormSelectOption): IFormSelectOption {
  if (typeof d === 'string') {
    return {name: d, value: d, data: d};
  }
  return d;
}

export function resolveData(data?: ISelectOptions|((dependents: any[]) => ISelectOptions)): ((dependents: any[]) => PromiseLike<IFormSelectOption[]>) {
  if (data === undefined) {
    return () => resolveImmediately([]);
  }
  if (Array.isArray(data)) {
    return () => resolveImmediately(data.map(toOption));
  }
  if (data instanceof Promise) {
    return () => data.then((r) => r.map(toOption));
  }
  //assume it is a function
  return (dependents: any[]) => {
    const r = data(dependents);
    if (r instanceof Promise) {
      return r.then((r) => r.map(toOption));
    }
    if (Array.isArray(r)) {
      return resolveImmediately(r.map(toOption));
    }
    return resolveImmediately(r);
  };
}
