import * as d3v3 from 'd3v3';
import { IPluginDesc } from 'visyn_core';
import { AFormElement } from './AFormElement';
import { IForm, IFormElementDesc, FormElementType } from '../interfaces';
import { Select3, IdTextPair, ISelect3Item, ISelect3Options } from './Select3';
import { ISelect2Option } from './FormSelect2';

declare type IFormSelect3Options = Partial<ISelect3Options<ISelect2Option>> & {
  return?: 'text' | 'id';
  data?: ISelect2Option[] | ((dependents: any) => ISelect2Option[]);
};

/**
 * Add specific options for select form elements
 */
export interface IFormSelect3 extends IFormElementDesc {
  type: FormElementType.SELECT3;
  /**
   * Additional options
   */
  options?: IFormSelect3Options & IFormElementDesc['options'];
}

/**
 * Select2 drop down field with integrated search field and communication to external data provider
 * Propagates the changes from the DOM select element using the internal `change` event
 */
export class FormSelect3 extends AFormElement<IFormSelect3> {
  private readonly isMultiple: boolean;

  private select3: Select3<IdTextPair>;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, elementDesc: IFormSelect3, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);

    this.isMultiple = pluginDesc.selection === 'multiple';
  }

  /**
   * Build the label and select element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3v3.Selection<any>) {
    this.addChangeListener();

    const testId = (this.elementDesc.label || this.elementDesc.id)
      .replace(/<\/?[^>]+(>|$)/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
    this.$rootNode = $formNode
      .append('div')
      .classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true)
      .attr('data-testid', testId);
    const rowNode = this.$rootNode.append('div').classed('row', true);
    this.setVisible(this.elementDesc.visible);
    this.appendLabel(rowNode);

    const options = Object.assign(this.elementDesc.options, { multiple: this.isMultiple });
    this.select3 = new Select3(options);
    const divNode = document.createElement('div');
    divNode.classList.add('col');
    rowNode.node().appendChild(divNode).appendChild(this.select3.node);

    this.elementDesc.attributes.clazz = this.elementDesc.attributes.clazz.replace('form-control', ''); // filter out the form-control class, because the border it creates doesn't contain the whole element due to absolute positioning and it isn't necessary
    this.setAttributes(rowNode.select('.select3'), this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    this.select3.on(Select3.EVENT_SELECT, (evt, prev: IdTextPair[], next: IdTextPair[]) => {
      this.fire(FormSelect3.EVENT_CHANGE, next);
    });
  }

  hasValue() {
    return this.select3.value.length > 0;
  }

  /**
   * Returns the selected value or if nothing found `null`
   * @returns {ISelect3Item<IdTextPair> | string | (ISelect3Item<IdTextPair> | string)[]}
   */
  get value(): (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[] {
    const returnValue = this.elementDesc.options.return;
    const returnFn = returnValue === 'id' ? (d) => d.id : returnValue === 'text' ? (d) => d.text : (d) => d;
    const value = <IdTextPair[]>this.select3.value;

    if (!value || value.length === 0) {
      return this.isMultiple ? [] : returnFn({ id: '', text: '' });
    }
    const data = value.map((d) => ({ id: d.id, text: d.text })).map(returnFn);
    return this.isMultiple ? data : data[0];
  }

  /**
   * Select the option by value. If no value found, then the first option is selected.
   * @param v If string then compares to the option value property. Otherwise compares the object reference.
   */
  set value(v: (ISelect3Item<IdTextPair> | string) | (ISelect3Item<IdTextPair> | string)[]) {
    const toIdTextPair = (d) => {
      if (typeof d === 'string') {
        return { id: d, text: d };
      }
      return {
        id: d.id ? d.id : d.text,
        text: d.text ? d.text : d.id,
      };
    };

    if (!v) {
      this.select3.value = this.previousValue = [];
      this.updateStoredValue();
      return;
    }

    this.previousValue = this.select3.value;
    if (Array.isArray(v) && v.length > 0 && !this.isMultiple) {
      // an array of items or string (id or text)
      this.select3.value = v.slice(0, 1).map(toIdTextPair);
    } else if (Array.isArray(v) && v.length > 0 && this.isMultiple) {
      this.select3.value = v.map(toIdTextPair);
    } else if (!Array.isArray(v)) {
      // an item or string (id or text)
      this.select3.value = [toIdTextPair(v)];
    }
    this.updateStoredValue();
  }

  focus() {
    this.select3.focus();
  }
}
