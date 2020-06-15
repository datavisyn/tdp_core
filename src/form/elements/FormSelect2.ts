/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import 'select2';
import * as d3 from 'd3';
import $ from 'jquery';
import {mixin} from 'phovea_core/src/index';
import {api2absURL} from 'phovea_core/src/ajax';
import AFormElement from './AFormElement';
import {IForm, IFormElementDesc} from '../interfaces';
import {IPluginDesc} from 'phovea_core/src/plugin';

declare type IFormSelect2Options = Select2Options & {
  return?: 'text'|'id';
  data?: ISelect2Option[] | ((dependents: any)=>ISelect2Option[]);
};

/**
 * Add specific options for select form elements
 */
export interface IFormSelect2 extends IFormElementDesc {
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

  private $select: d3.Selection<any>;

  private $jqSelect: JQuery;

  private readonly isMultiple: boolean;

  private readonly listener = () => {
    this.fire(FormSelect2.EVENT_CHANGE, this.value, this.$jqSelect);
  }

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, elementDesc: IFormSelect2, readonly pluginDesc: IPluginDesc) {
    super(form,elementDesc, pluginDesc);

    this.isMultiple = (pluginDesc.selection === 'multiple');
  }

  /**
   * Build the label and select element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3.Selection<any>) {
    this.addChangeListener();

    this.$node = $formNode.append('div').classed('form-group', true);
    this.setVisible(this.elementDesc.visible);
    this.appendLabel();

    this.$select = this.$node.append('select');
    this.setAttributes(this.$select, this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    const values = this.handleDependent(() => {
      //not supported
    });
    const df = this.elementDesc.options.data;
    const data = Array.isArray(df) ? df : (typeof df === 'function' ? df(values) : undefined);
    this.buildSelect2(this.$select, this.elementDesc.options || {}, data);


    // propagate change action with the data of the selected option
    this.$jqSelect.on('change.propagate', this.listener);
  }

  /**
   * Builds the jQuery select2
   */
  private buildSelect2($select: d3.Selection<any>, options: IFormSelect2Options, data?: ISelect2Option[]) {
    const select2Options: Select2Options = {};

    let initialValue: string[] = [];
    const defaultVal: any = this.getStoredValue(null);

    if (defaultVal) {
      if (this.isMultiple) {
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

    if (this.isMultiple) {
      select2Options.multiple = true;
      select2Options.allowClear = true;
    }
    mixin(select2Options, options.ajax ? DEFAULT_AJAX_OPTIONS : DEFAULT_OPTIONS, options, { data });

    this.$jqSelect = (<any>$($select.node())).select2(select2Options).val(initialValue).trigger('change');
    // force the old value from initial
    this.previousValue = this.resolveValue(this.$jqSelect.select2('data'));

    if (defaultVal) {
      this.fire(FormSelect2.EVENT_INITIAL_VALUE, this.value, null);
    }
    return this.$jqSelect;
  }

  private resolveValue(items: ISelect2Option[]) {
    const returnValue = this.elementDesc.options.return;
    const returnF = returnValue === 'id' ? (d) => d.id : (returnValue === 'text' ? (d) => d.text : (d) => d);
    if (!items || items.length === 0) {
      return this.isMultiple ?  [] : returnF({id: '', text: ''});
    }
    const data = items.map((d) => ({id: d.id, text: d.text, data: d.data? d.data : undefined})).map(returnF);
    return this.isMultiple ? data : data[0];
  }

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {string|{name: string, value: string, data: any}|null}
   */
  get value(): (ISelect2Option|string)|(ISelect2Option|string)[] {
    return this.resolveValue(this.$jqSelect.select2('data'));
  }

  hasValue() {
    const v = this.value;
    if (this.isMultiple) {
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
      this.$jqSelect.off('change.propagate', this.listener);

      // if value is undefined or null, clear
      if (!v) {
        this.$jqSelect.val([]).trigger('change');
        this.previousValue = this.isMultiple ? [] : null;
        return;
      }
      let r: string|string[] = null;

      if (this.isMultiple) {
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
      this.$jqSelect.val(r).trigger('change');
      this.previousValue = this.value; // force set
      this.updateStoredValue();
    } finally {
      this.$jqSelect.on('change.propagate', this.listener);
    }
  }

  focus() {
    this.$jqSelect.select2('open');
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
