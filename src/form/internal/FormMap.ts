/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import 'select2';
import {event as d3event} from 'd3';
import * as $ from 'jquery';
import AFormElement, {toData} from './AFormElement';
import {IFormElementDesc, IFormParent, FormElementType} from '../interfaces';
import {ISelectOptions, resolveData} from './FormSelect';
import {DEFAULT_OPTIONS, DEFAULT_AJAX_OPTIONS} from './FormSelect2';
import {mixin} from 'phovea_core/src';
import {IFormElement} from '../';
import * as session from 'phovea_core/src/session';
import {resolveImmediately} from 'phovea_core/src';
import {ISelect3Options, default as Select3, IdTextPair} from './Select3';

export interface ISubDesc {
  name: string;
  value: string;
}
export interface ISubInputDesc extends ISubDesc {
  type: FormElementType.INPUT_TEXT;
}

export interface ISubSelectDesc extends ISubDesc {
  type: FormElementType.SELECT;
  /**
   * teh data, a promise of the data or a function computing the data or promise
   */
  optionsData: ISelectOptions|(() => ISelectOptions);
}
export interface ISubSelect2Desc extends ISubDesc {
  type: FormElementType.SELECT2;
  optionsData?: ISelectOptions|(() => ISelectOptions);
  return?: 'text'|'id';
  multiple?: boolean;
  ajax?: any;
}

export interface ISubSelect3Desc extends Partial<ISelect3Options<IdTextPair>>, ISubDesc {
  type: FormElementType.SELECT3;
  return?: 'text'|'id';
}

declare type ISubDescs = ISubInputDesc|ISubSelectDesc|ISubSelect2Desc|ISubSelect3Desc;

/**
 * Add specific options for input form elements
 */
export interface IFormMapDesc extends IFormElementDesc {
  /**
   * Additional options
   */
  options?: {
    badgeProvider?: (value: IFormRow[], ...dependent: IFormElement[]) => Promise<string> | string;

    entries: (ISubDescs[])|((...dependent: IFormElement[])=>(ISubDescs[]));

    /**
     * whether an element can just be selected once
     */
    uniqueKeys?: boolean;

    sessionKeySuffix?: string;

    /**
     * @default true
     */
    defaultSelection?: boolean;
  };
}

export interface IFormRow {
  key: string;
  value: any;
}

function hasInlineParent(node: HTMLElement) {
  while(node.parentElement) {
    node = node.parentElement;
    if (node.classList.contains('parameters')) {
      return node.classList.contains('form-inline');
    }
  }
  return false;
}

export default class FormMap extends AFormElement<IFormMapDesc> {

  private $group: d3.Selection<any>;
  private rows: IFormRow[] = [];
  private readonly inline: boolean;

  private readonly inlineOnChange: (formElement: IFormElement, value: any, data: any, previousValue: any)=>void;

  /**
   * Constructor
   * @param parent
   * @param $parent
   * @param desc
   */
  constructor(parent: IFormParent, $parent, desc: IFormMapDesc) {
    super(parent, desc);

    this.$node = $parent.append('div').classed('form-group', true);
    this.inline = hasInlineParent(<HTMLElement>this.$node.node());
    if (this.inline && this.desc.onChange) {
      //change the default onChange handler for the inline cas
      this.inlineOnChange = this.desc.onChange;
      this.desc.onChange = null;
    }

    this.build();
  }

  private updateBadge() {
    const dependent = (this.desc.dependsOn || []).map((id) => this.parent.getElementById(id));
    resolveImmediately(this.desc.options.badgeProvider(this.value, ...dependent)).then((text) => {
      this.$node.select('span.badge').html(text).attr('title', `${text} items remaining after filtering`);
    });
  }

  private get sessionKey() {
    return `formBuilder.map.${this.id}${this.desc.options.sessionKeySuffix || ''}`;
  }

  protected updateStoredValue() {
    if (!this.desc.useSession) {
      return;
    }
    session.store(this.sessionKey, this.value);
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.desc.useSession) {
      return defaultValue;
    }
    return session.retrieve(this.sessionKey, defaultValue);
  }

  /**
   * Build the label and input element
   * Bind the change listener and propagate the selection by firing a change event
   */
  protected build() {
    this.addChangeListener();
    if (this.desc.visible === false) {
      this.$node.classed('hidden', true);
    }
    if (this.inline) {
      if (!this.desc.options.badgeProvider) {
        //default badge provider for inline
        this.desc.options.badgeProvider = (rows) => rows.length === 0 ? '' : rows.length.toString();
      }
      this.$node.classed('dropdown', true);
      this.$node.html(`
          <button class="btn btn-default dropdown-toggle" type="button" id="${this.desc.attributes.id}l" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            ${this.desc.label}
            <span class="badge"></span>
            <span class="caret"></span>
          </button>
          <div class="dropdown-menu" aria-labelledby="${this.desc.attributes.id}l" style="min-width: 25em">
            <div class="form-horizontal"></div>
            <div>
                <button class="btn btn-default btn-sm right">Apply</button>      
            </div>
          </div>
      `);
      this.$node.select('button.right').on('click', () => {

        (<MouseEvent>d3event).preventDefault();
      });
      this.$group = this.$node.select('div.form-horizontal');
      this.$group.on('click', () => {
        // stop click propagation to avoid closing the dropdown
        (<MouseEvent>d3event).stopPropagation();
      });

    } else {
      if (!this.desc.hideLabel) {
        const $label = this.$node.append('label').attr('for', this.desc.attributes.id);
        if (this.desc.options.badgeProvider) {
          $label.html(`${this.desc.label} <span class="badge"></span>`);
        } else {
          $label.text(this.desc.label);
        }
      }
      this.$group = this.$node.append('div');
    }
    this.setAttributes(this.$group, this.desc.attributes);
    // adapt default settings
    this.$group.classed('form-horizontal', true).classed('form-control', false).classed('form-group-sm', true);
    this.rows = this.getStoredValue([]);
    this.previousValue = this.value;

    if (this.desc.options.badgeProvider) {
      this.updateBadge();
      this.on('change', () => {
        this.updateBadge();
      });
    }

    this.handleDependent(() => {
      this.rows = []; // clear old
      this.buildMap();
      if (this.desc.options.badgeProvider) {
        this.updateBadge();
      }
    });

    this.buildMap();

    if (this.inline && this.inlineOnChange) {
      // trigger change on onChange listener just when the dialog is closed
      $(this.$node.node()).on('hidden.bs.dropdown', () => {
        const v = this.value;
        const previous = this.previousValue;
        if (isEqual(v, previous)) {
          return;
        }
        this.previousValue = v;
        this.inlineOnChange(this, v, toData(v), previous);
      });
    }
  }

  private addValueEditor(row: IFormRow, parent: Element, entries: ISubDescs[]) {
    const that = this;
    const desc = entries.find((d) => d.value === row.key);
    const defaultSelection = this.desc.options.defaultSelection !== false;

    function mapOptions(d: any|string) {
      const value = typeof d === 'string' || !d ? d : (d.value || d.id);
      const name = typeof d === 'string' || !d ? d : (d.name || d.text);
      return `<option value="${value}">${name}</option>`;
    }

    const initialValue = row.value;

    switch (desc.type) {
      case FormElementType.SELECT:
        parent.insertAdjacentHTML('afterbegin', `<select class="form-control" style="width: 100%"></select>`);
        // register on change listener
        parent.firstElementChild.addEventListener('change', function (this: HTMLSelectElement) {
          row.value = this.value;
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        });
        resolveData(desc.optionsData)([]).then((values) => {
          parent.firstElementChild.innerHTML = (!defaultSelection ? `<option value="">Select me...</option>` : '') + values.map(mapOptions).join('');
          if (initialValue) {
            (<HTMLSelectElement>parent.firstElementChild).selectedIndex = values.map((d) => typeof d === 'string' ? d : d.value).indexOf(initialValue);
          } else if (defaultSelection) {
            const first = values[0];
            row.value = typeof first === 'string' || !first ? first : first.value;
          }
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        });
        break;
      case FormElementType.SELECT2:
        parent.insertAdjacentHTML('afterbegin', `<select class="form-control" style="width: 100%"></select>`);

        resolveData(desc.optionsData)([]).then((values) => {
          const initially = initialValue ? ((Array.isArray(initialValue) ? initialValue : [initialValue]).map((d) => typeof d === 'string' ? d : d.id)) : [];
          // in case of ajax but have default value
          if (desc.ajax && values.length === 0 && initialValue) {
            values = Array.isArray(initialValue) ? initialValue : [initialValue];
          }
          parent.firstElementChild.innerHTML = values.map(mapOptions).join('');
          const s = parent.firstElementChild;
          const $s = (<any>$(s));
          // merge only the default options if we have no local data
          $s.select2(mixin({}, desc.ajax ? DEFAULT_AJAX_OPTIONS: DEFAULT_OPTIONS, desc));
          if (initialValue) {
            $s.val(initially).trigger('change');
          } else if (!defaultSelection && that.desc.options.uniqueKeys) {
            // force no selection
            $s.val([]).trigger('change');
          }

          if (values.length > 0 && !initialValue && defaultSelection) {
            const first = values[0];
            row.value = typeof first === 'string' || !first ? first : first.value;
          }

          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
          // register on change listener use full select2 items
          $s.on('change', function (this: HTMLSelectElement) {
            const data = $s.select2('data');
            if (data.length === 0) {
              row.value = null;
            } else {
              if (desc.return === 'id') {
                row.value = data.map((r) => r.id);
              } else if (desc.return === 'text') {
                row.value = data.map((r) => r.text);
              } else {
                row.value = data.map((r) => ({'id': r.id, 'text': r.text}));
              }
              if (row.value.length === 1) {
                row.value = row.value[0];
              }
            }
            that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
          });
        });
        break;
      case FormElementType.SELECT3:
        const select3 = new Select3(desc);
        parent.appendChild(select3.node);
        if (initialValue) {
          select3.value = Array.isArray(initialValue) ? initialValue : [initialValue];
        } else if (!defaultSelection && that.desc.options.uniqueKeys) {
          select3.value = [];
        }
        that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        select3.on(Select3.EVENT_SELECT, (evt, prev: IdTextPair[], next: IdTextPair[]) => {
          row.value = next;
          this.fire(FormMap.EVENT_CHANGE, next);
        });
        break;
      default:
        parent.insertAdjacentHTML('afterbegin', `<input class="form-control" value="${initialValue || ''}">`);
        parent.firstElementChild.addEventListener('change', function (this: HTMLInputElement) {
          row.value = this.value;
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        });
        that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
    }
  }

  private buildMap() {
    if (Array.isArray(this.desc.options.entries)) {
      this.buildMapImpl(this.desc.options.entries);
    } else { // function case
      const dependent = (this.desc.dependsOn || []).map((id) => this.parent.getElementById(id));
      const entries = this.desc.options.entries(...dependent);
      this.buildMapImpl(entries);
    }
  }

  private buildMapImpl(entries: ISubDescs[]) {
    const that = this;
    const group = <HTMLDivElement>this.$group.node();
    group.innerHTML = ''; // remove all approach
    // filter to only valid entries
    const values = this.rows.filter((d) => !!d.key && entries.find((e) => e.value === d.key));
    // put empty row at the end
    values.push({key: '', value: null});
    this.rows = [];

    const updateOptions = () => {
      // disable used options
      if (!this.desc.options.uniqueKeys) {
        return;
      }
      const keys = new Set<string>(this.rows.map((d) => d.key));
      Array.from(group.querySelectorAll('select.map-selector')).forEach((select: HTMLSelectElement) => {
        const selected = select.selectedIndex;
        Array.from(select.options).forEach((option, i) => {
          option.disabled = i !== selected && option.value !== '' && keys.has(option.value);
        });
      });
    };

    const renderRow = (d: IFormRow) => {
      this.rows.push(d);
      const row = group.ownerDocument.createElement('div');
      row.classList.add('form-group');
      group.appendChild(row);
      row.innerHTML = `
        <div class="col-sm-5">
          <select class="form-control map-selector">
            <option value="">Select...</option>
            ${entries.map((o) => `<option value="${o.value}" ${o.value === d.key ? 'selected="selected"' : ''}>${o.name}</option>`).join('')}
          </select>
        </div>
        <div class="col-sm-6"></div>
        <div class="col-sm-1"><button class="btn btn-default btn-sm" title="Remove"><span aria-hidden="true">×</span></button></div>`;

      const valueElem = <HTMLElement>row.querySelector('.col-sm-6');
      if (d.key) { // has value
        this.addValueEditor(d, valueElem, entries);
      } else {
        // add remove all button
      }
      row.querySelector('div.col-sm-1 button').addEventListener('click', (evt: MouseEvent) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (d.key) {
          // remove this row
          row.remove();
          that.rows.splice(that.rows.indexOf(d), 1);
          updateOptions();
        } else {
          // remove all rows and add the dummy one = me again
          that.rows = [d];
          const children = Array.from(group.children);
          // remove all dom rows
          children.splice(0, children.length - 1).forEach((d) => d.remove());
          updateOptions();
        }
        that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
      });
      row.querySelector('select').addEventListener('change', function (this: HTMLSelectElement) {
        if (!this.value) {
          // remove this row
          row.remove();
          that.rows.splice(that.rows.indexOf(d), 1);
          updateOptions();
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
          return;
        }
        if (d.key !== this.value) { // value changed
          if (d.key) { //has an old value?
            valueElem.innerHTML = '';
          } else {
            // ensure that there is an empty row
            renderRow({key: '', value: null});
          }
          d.key = this.value;
          that.addValueEditor(d, valueElem, entries);
          updateOptions();
        }
      });
    };
    values.forEach(renderRow);
    updateOptions();
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    // just rows with a valid key and value
    const validRows = this.rows.filter((d) => d.key && d.value !== null);

    // create copies from each row, such that the previous values don't reference to this.value
    return validRows.map((row) => Object.assign({}, row));
  }

  hasValue() {
    return this.value.length > 0;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: IFormRow[]) {
    if (isEqual(v, this.value)) {
      return;
    }
    this.rows = v;
    this.previousValue = this.value; // force update
    this.buildMap();
    this.updateBadge();
  }

  focus() {
    // open dropdown
    $(this.$node.select('.dropdown-menu').node()).show();
  };

}

function isEqual(a: IFormRow[], b: IFormRow[]) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((ai,i) => {
    const bi = b[i];
    return ai.key === bi.key && ai.value === bi.value;
  });
}

export declare type IFormMultiMap = { [key: string]: any | any[] };

export function convertRow2MultiMap(rows: IFormRow[]): IFormMultiMap {
  if (!rows) {
    return {};
  }
  const map = new Map<string, any[]>();
  rows.forEach((row) => {
    if (!map.has(row.key)) {
      map.set(row.key, []);
    }
    const v = map.get(row.key);
    if (Array.isArray(row.value)) {
      v.push(...row.value);
    } else {
      v.push(row.value);
    }
  });
  const r: IFormMultiMap = {};
  map.forEach((v, k) => {
    if (v.length === 1) {
      r[k] = v[0];
    } else {
      r[k] = v;
    }
  });
  return r;
}
