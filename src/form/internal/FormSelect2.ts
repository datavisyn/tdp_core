/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import 'select2';
import * as d3 from 'd3';
import * as $ from 'jquery';
import {mixin} from 'phovea_core/src/index';
import {api2absURL} from 'phovea_core/src/ajax';
import AFormElement from './AFormElement';
import {IFormParent} from '../interfaces';
import {IFormSelectDesc} from './FormSelect';

declare type IFormSelect2Options = Select2Options & {
  return?: 'text'|'id';
  data?: ISelect2Option[] | ((dependents: any)=>ISelect2Option[]);
};

/**
 * Add specific options for select form elements
 */
export interface IFormSelect2 extends IFormSelectDesc {
  /**
   * Additional options
   */
  options?: IFormSelect2Options;
}

export interface ISelect2Option {
  id: string;
  text: string;
  data?: any;
}

export const DEFAULT_OPTIONS = {
  placeholder: 'Start typing...',
  theme: 'bootstrap',
  minimumInputLength: 0,
  //selectOnClose: true,
  //tokenSeparators: [' ', ',', ';'], // requires multiple attribute for select element
  escapeMarkup: (markup) => markup,
  templateResult: (item: any) => item.text,
  templateSelection: (item: any) => item.text
};

export const DEFAULT_AJAX_OPTIONS = Object.assign({
  ajax: {
    url: api2absURL('url_needed'), // URL
    dataType: 'json',
    delay: 250,
    cache: true,
    data: (params: any) => {
      return {
        query: params.term === undefined ? '': params.term, // search term from select2
        page: params.page === undefined ? 0: params.page
      };
    },
    processResults: (data, params) => {
      params.page = params.page === undefined ? 0: params.page;
      return {
        results: data.items,
        pagination: { // indicate infinite scrolling
          more: data.more
        }
      };
    }
  }
}, DEFAULT_OPTIONS);

/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export default class FormSelect2 extends AFormElement<IFormSelect2> {

  private $select: JQuery;

  private readonly multiple: boolean;

  private readonly listener = () => {
    this.fire(FormSelect2.EVENT_CHANGE, this.value, this.$select);
  };

  /**
   * Constructor
   * @param parent
   * @param $parent
   * @param desc
   * @param multiple
   */
  constructor(parent: IFormParent, $parent, desc: IFormSelect2, multiple: 'multiple'|'single' = 'single') {
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

    const $select = this.$node.append('select');
    this.setAttributes($select, this.desc.attributes);

    const values = this.handleDependent(() => {
      //not supported
    });
    const df = this.desc.options.data;
    const data = Array.isArray(df) ? df : (typeof df === 'function' ? df(values) : undefined);
    this.$select = this.buildSelect2($select, this.desc.options || {}, data);


    // propagate change action with the data of the selected option
    this.$select.on('change.propagate', this.listener);
  }

  /**
   * Builds the jQuery select2
   */
  private buildSelect2($select: d3.Selection<any>, options: IFormSelect2Options, data?: ISelect2Option[]) {
    const select2Options: Select2Options = {};

    let initialValue: string[] = [];
    const defaultVal: any = this.getStoredValue(null);

    if (defaultVal) {
      if (this.multiple) {
        const defaultValues = Array.isArray(defaultVal) ? defaultVal : [defaultVal];
        initialValue = defaultValues.map((d) => typeof d === 'string' ? d : d.id);
        if (!data) { //derive default data if none is set explictly
          data = defaultValues.map((d) => (typeof d === 'string' ? ({id: d, text: d}) : d));
        }
      } else {
        initialValue = [typeof defaultVal === 'string' ? defaultVal : <string>defaultVal.id];
        if (!data) {
          data = [typeof defaultVal === 'string' ? ({id: defaultVal, text: defaultVal}) : defaultVal];
        }
      }
    }

    if (this.multiple) {
      select2Options.multiple = true;
      select2Options.allowClear = true;
    }
    mixin(select2Options, options.ajax ? DEFAULT_AJAX_OPTIONS : DEFAULT_OPTIONS, options, { data });

    const $s = (<any>$($select.node())).select2(select2Options).val(initialValue).trigger('change');
    // force the old value from initial
    this.previousValue = this.resolveValue($s.select2('data'));
    return $s;
  }

  private resolveValue(items: ISelect2Option[]) {
    const returnValue = this.desc.options.return;
    const returnF = returnValue === 'id' ? (d) => d.id : (returnValue === 'text' ? (d) => d.text : (d) => d);
    if (!items || items.length === 0) {
      return this.multiple ?  [] : returnF({id: '', text: ''});
    }
    const data = items.map((d) => ({id: d.id, text: d.text, data: d.data? d.data : undefined})).map(returnF);
    return this.multiple ? data : data[0];
  }

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {string|{name: string, value: string, data: any}|null}
   */
  get value(): (ISelect2Option|string)|(ISelect2Option|string)[] {
    return this.resolveValue(this.$select.select2('data'));
  }

  hasValue() {
    const v = this.value;
    if (this.multiple) {
      return (<any[]>v).length > 0;
    } else {
      return v !== '' || (<any>v).id !== '';
    }
  }

  /**
   * Select the option by value. If no value found, then the first option is selected.
   * @param v If string then compares to the option value property. Otherwise compares the object reference.
   */
  set value(v: (ISelect2Option|string)|(ISelect2Option|string)[]) {
    try {
      this.$select.off('change.propagate', this.listener);

      // if value is undefined or null, clear
      if (!v) {
        this.$select.val([]).trigger('change');
        this.previousValue = this.multiple ? [] : null;
        return;
      }
      let r: string|string[] = null;

      if (this.multiple) {
        const values = Array.isArray(v) ? v : [v];
        r = values.map((d: any) => d.value || d.id);
        const old = <ISelect2Option[]>this.value;
        if (sameIds(old.map((d) => d.id), r)) {
          return;
        }
      } else {
        const vi: any = Array.isArray(v) ? v[0] : v;
        r = vi;

        if (vi.value || vi.id) {
          r = vi.value || vi.id;
        }

        const old = <ISelect2Option>this.value;
        if (old.id === r) { // no change
          return;
        }
      }
      // need to select just the ids
      // TODO doesn't work for AJAX based solutions
      this.$select.val(r).trigger('change');
      this.previousValue = this.value; // force set
    } finally {
      this.$select.on('change.propagate', this.listener);
    }
  }

  focus() {
    this.$select.select2('open');
  }

}

/**
 * compare array independent of the order
 * @param a
 * @param b
 * @returns {boolean}
 */
function sameIds(a: string[], b: string[]) {
  if (a.length !== b.length) {
    return false;
  }
  const bids = new Set(b);
  // all of a contained in b
  return a.every((d) => bids.has(d));
}
