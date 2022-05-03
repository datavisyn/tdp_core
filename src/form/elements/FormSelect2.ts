import { merge } from 'lodash';
import 'select2';
import * as d3 from 'd3v3';
import $ from 'jquery';
import { AFormElement } from './AFormElement';
import { IForm, IFormElementDesc, FormElementType } from '../interfaces';
import { AppContext } from '../../app';
import { IPluginDesc } from '../../base';

declare type IFormSelect2Options = Select2Options & {
  return?: 'text' | 'id';
  data?: ISelect2Option[] | ((dependents: any) => ISelect2Option[]);
  /**
   * Define one or multiple values that are selected when initializing the Select2
   * Values as array only works when Select2 is `multiple` mode.
   * @default null
   */
  selectedDefaultValue?: string | string[] | null;
};

/**
 * Add specific options for select form elements
 */
export interface IFormSelect2 extends IFormElementDesc {
  type: FormElementType.SELECT2;
  /**
   * Additional options
   */
  options?: IFormSelect2Options & IFormElementDesc['options'];
}

export interface ISelect2Option {
  id: string;
  text: string;
  data?: any;
}

/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export class FormSelect2 extends AFormElement<IFormSelect2> {
  public static readonly DEFAULT_OPTIONS = {
    placeholder: 'Start typing...',
    theme: 'bootstrap',
    minimumInputLength: 0,
    // selectOnClose: true,
    // tokenSeparators: [' ', ',', ';'], // requires multiple attribute for select element
    escapeMarkup: (markup) => markup,
    templateResult: (item: any) => item.text,
    templateSelection: (item: any) => item.text,
  };

  public static readonly DEFAULT_AJAX_OPTIONS = {
    ajax: {
      url: AppContext.getInstance().api2absURL('url_needed'), // URL
      dataType: 'json',
      delay: 250,
      cache: true,
      data: (params: any) => {
        return {
          query: params.term === undefined ? '' : params.term, // search term from select2
          page: params.page === undefined ? 0 : params.page,
        };
      },
      processResults: (data, params) => {
        params.page = params.page === undefined ? 0 : params.page;
        return {
          results: data.items,
          pagination: {
            // indicate infinite scrolling
            more: data.more,
          },
        };
      },
    },
    ...FormSelect2.DEFAULT_OPTIONS,
  };

  private $select: d3.Selection<any>;

  private $jqSelect: JQuery;

  private readonly isMultiple: boolean;

  private readonly listener = () => {
    this.fire(FormSelect2.EVENT_CHANGE, this.value, this.$jqSelect);
  };

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, elementDesc: IFormSelect2, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);

    this.isMultiple = pluginDesc.selection === 'multiple';
  }

  /**
   * Build the label and select element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3.Selection<any>) {
    this.addChangeListener();

    this.$rootNode = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
    const rowNode = this.$rootNode.append('div').classed('row', true);
    this.setVisible(this.elementDesc.visible);
    this.appendLabel(rowNode);

    const $colSelectNode = rowNode.append('div').classed('col', true);
    this.$inputNode = $colSelectNode.append('select');
    this.setAttributes(this.$inputNode, this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    const values = this.handleDependent(() => {
      // not supported
    });
    const df = this.elementDesc.options.data;
    const data = Array.isArray(df) ? df : typeof df === 'function' ? df(values) : undefined;
    this.buildSelect2(this.$inputNode, this.elementDesc.options || {}, data);

    // propagate change action with the data of the selected option
    this.$jqSelect.on('change.propagate', this.listener);
  }

  /**
   * Builds the jQuery select2
   */
  private buildSelect2($select: d3.Selection<any>, options: IFormSelect2Options, data?: ISelect2Option[]) {
    const select2Options: Select2Options = {};

    let initialValue: string[] = [];
    const defaultVal: any = this.getStoredValue(options.selectedDefaultValue || null);

    if (defaultVal) {
      if (this.isMultiple) {
        const defaultValues = Array.isArray(defaultVal) ? defaultVal : [defaultVal];
        initialValue = defaultValues.map((d) => (typeof d === 'string' ? d : d.id));
        if (!data) {
          // derive default data if none is set explictly
          data = defaultValues.map((d) => (typeof d === 'string' ? { id: d, text: d } : d));
        }
      } else {
        initialValue = [typeof defaultVal === 'string' ? defaultVal : <string>defaultVal.id];
        if (!data) {
          data = [typeof defaultVal === 'string' ? { id: defaultVal, text: defaultVal } : defaultVal];
        }
      }
    }

    if (this.isMultiple) {
      select2Options.multiple = true;
      select2Options.allowClear = true;
    }
    merge(select2Options, options.ajax ? FormSelect2.DEFAULT_AJAX_OPTIONS : FormSelect2.DEFAULT_OPTIONS, options, { data });

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
    const returnF = returnValue === 'id' ? (d) => d.id : returnValue === 'text' ? (d) => d.text : (d) => d;
    if (!items || items.length === 0) {
      return this.isMultiple ? [] : returnF({ id: '', text: '' });
    }
    const data = items.map((d) => ({ id: d.id, text: d.text, data: d.data ? d.data : undefined })).map(returnF);
    return this.isMultiple ? data : data[0];
  }

  hasValue() {
    const v = this.value;
    if (this.isMultiple) {
      return (<any[]>v).length > 0;
    }
    return v !== '' || (<any>v).id !== '';
  }

  /**
   * Select the option by value. If no value found, then the first option is selected.
   * @param v If string then compares to the option value property. Otherwise compares the object reference.
   */
  set value(v: (ISelect2Option | string) | (ISelect2Option | string)[]) {
    try {
      this.$jqSelect.off('change.propagate', this.listener);

      // if value is undefined or null, clear
      if (!v) {
        this.$jqSelect.val([]).trigger('change');
        this.previousValue = this.isMultiple ? [] : null;
        return;
      }
      let r: string | string[] = null;

      if (this.isMultiple) {
        const values = Array.isArray(v) ? v : [v];
        r = values.map((d: any) => d.value || d.id);
        const old = <ISelect2Option[]>this.value;
        if (
          FormSelect2.sameIds(
            old.map((d) => d.id),
            r,
          )
        ) {
          return;
        }
      } else {
        const vi: any = Array.isArray(v) ? v[0] : v;
        r = vi;

        if (vi.value || vi.id) {
          r = vi.value || vi.id;
        }

        const old = <ISelect2Option>this.value;
        if (old.id === r) {
          // no change
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

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {string|{name: string, value: string, data: any}|null}
   */
  get value(): (ISelect2Option | string) | (ISelect2Option | string)[] {
    return this.resolveValue(this.$jqSelect.select2('data'));
  }

  focus() {
    this.$jqSelect.select2('open');
  }

  /**
   * compare array independent of the order
   * @param a
   * @param b
   * @returns {boolean}
   */
  static sameIds(a: string[], b: string[]) {
    if (a.length !== b.length) {
      return false;
    }
    const bids = new Set(b);
    // all of a contained in b
    return a.every((d) => bids.has(d));
  }
}
