/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import * as d3 from 'd3';
import * as session from 'phovea_core/src/session';
import AFormElement from './AFormElement';
import {IFormElementDesc, IForm, IFormElement} from '../interfaces';
import {resolveImmediately} from 'phovea_core/src';
import {IPluginDesc} from 'phovea_core/src/plugin';


export interface IFormSelectOption {
  name: string;
  value: string;
  data: any;
}

export interface IFormSelectOptionGroup {
  name: string;
  children: IFormSelectOption[];
}

export declare type ISelectOptions = ((string|IFormSelectOption)[]|Promise<(string|IFormSelectOption)[]>);
export declare type IHierarchicalSelectOptions = ((string|IFormSelectOption|IFormSelectOptionGroup)[]|Promise<(string|IFormSelectOption|IFormSelectOptionGroup)[]>);

export interface IFormSelectOptions {
  /**
   * Data for the options elements of the select
   */
  optionsData?: IHierarchicalSelectOptions|((dependents: any[]) => IHierarchicalSelectOptions);
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

  updateOptionElements(data: (string|IFormSelectOption|IFormSelectOptionGroup)[]): void;
}

/**
 * Select form element instance
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export default class FormSelect extends AFormElement<IFormSelectDesc> implements IFormSelectElement {

  private $select: d3.Selection<any>;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param $parent The parent node this element will be attached to
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, $parent: d3.Selection<any>, elementDesc: IFormSelectDesc, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);

    this.$node = $parent.append('div').classed('form-group', true);

    this.build();
  }

  protected updateStoredValue() {
    if (!this.elementDesc.useSession) {
      return;
    }
    session.store(`${this.id}_selectedIndex`, this.getSelectedIndex());
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.elementDesc.useSession) {
      return defaultValue;
    }
    return session.retrieve(`${this.id}_selectedIndex`, defaultValue);
  }

  /**
   * Build the label and select element
   */
  protected build() {
    super.build();

    this.$select = this.$node.append('select');
    this.setAttributes(this.$select, this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  initialize() {
    super.initialize();

    const options = this.elementDesc.options;

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
      const index = options.selectedIndex !== undefined ? options.selectedIndex : Math.min(items.length -1, defaultSelectedIndex);
      this.previousValue = items[index];
      this.$select.property('selectedIndex', index);

      if (options.selectedIndex === undefined && index > 0) {
        this.fire(FormSelect.EVENT_INITIAL_VALUE, this.value, items[0]);
      }
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
  updateOptionElements(data: (string|IFormSelectOption|IFormSelectOptionGroup)[]) {
    const options = data.map(toOption);

    const isGroup = (d: IFormSelectOption|IFormSelectOptionGroup): d is IFormSelectOptionGroup => {
      return Array.isArray((<any>d).children);
    };
    const anyGroups = data.some(isGroup);

    this.$select.selectAll('option, optgroup').remove();

    if (!anyGroups) {
      const $options = this.$select.selectAll('option').data(<IFormSelectOption[]>options);
      $options.enter().append('option');
      $options.attr('value', (d) => d.value).html((d) => d.name);
      $options.exit().remove();
      return;
    }
    const node = <HTMLSelectElement>this.$select.node();
    const $options = this.$select.selectAll(() => node.children).data(options);
    $options.enter()
      .append((d) => node.ownerDocument.createElement(isGroup ? 'optgroup' : 'option'));

    const $sub = $options.filter(isGroup)
      .attr('label', (d) => d.name)
      .selectAll('option').data((d) => (<IFormSelectOptionGroup>d).children);
    $sub.enter().append('option');
    $sub.attr('value', (d) => d.value).html((d) => d.name);
    $sub.exit().remove();

    $options.filter((d) => !isGroup)
      .attr('value', (d) => ((<IFormSelectOption>d).value))
      .html((d) => d.name);

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
        this.updateStoredValue();
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

function toOption(d: string|IFormSelectOption|IFormSelectOptionGroup): IFormSelectOption|IFormSelectOptionGroup {
  if (typeof d === 'string') {
    return {name: d, value: d, data: d};
  }
  return d;
}

export function resolveData(data?: IHierarchicalSelectOptions|((dependents: any[]) => IHierarchicalSelectOptions)): ((dependents: any[]) => PromiseLike<(IFormSelectOption|IFormSelectOptionGroup)[]>) {
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
