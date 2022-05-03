import { merge } from 'lodash';
import 'select2';
import { event as d3event } from 'd3';
import $ from 'jquery';
import * as d3 from 'd3';
import { AFormElement } from './AFormElement';
import { IFormElementDesc, IForm, FormElementType } from '../interfaces';
import { ISelectOptions, IFormSelectOption, FormSelect } from './FormSelect';
import { FormSelect2 } from './FormSelect2';
import type { IFormElement } from '..';
import { ISelect3Options, Select3, IdTextPair } from './Select3';
import { UserSession } from '../../app';
import { IPluginDesc } from '../../base';
import { I18nextManager } from '../../i18n';

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
   * the data, a promise of the data or a function computing the data or promise
   */
  optionsData: ISelectOptions | (() => ISelectOptions);
}
export interface ISubSelect2Desc extends ISubDesc {
  type: FormElementType.SELECT2;
  optionsData?: ISelectOptions | (() => ISelectOptions);
  return?: 'text' | 'id';
  multiple?: boolean;
  ajax?: any;
}

export interface ISubSelect3Desc extends Partial<ISelect3Options<IdTextPair>>, ISubDesc {
  type: FormElementType.SELECT3;
  return?: 'text' | 'id';
  name: string;
}

declare type ISubDescs = ISubInputDesc | ISubSelectDesc | ISubSelect2Desc | ISubSelect3Desc;

/**
 * Add specific options for input form elements
 */
export interface IFormMapDesc extends IFormElementDesc {
  type: FormElementType.MAP;
  /**
   * Additional options
   */
  options?: {
    badgeProvider?: (value: IFormRow[], ...dependent: IFormElement[]) => Promise<string> | string;

    entries: ISubDescs[] | ((...dependent: IFormElement[]) => ISubDescs[]);

    /**
     * whether an element can just be selected once
     */
    uniqueKeys?: boolean;

    sessionKeySuffix?: string;

    /**
     * @default true
     */
    defaultSelection?: boolean;
  } & IFormElementDesc['options'];
}

export interface IFormRow {
  key: string;
  value: any;
}

export class FormMap extends AFormElement<IFormMapDesc> {
  private $group: d3.Selection<any>;

  private rows: IFormRow[] = [];

  private inline: boolean;

  private inlineOnChange: (formElement: IFormElement, value: any, data: any, previousValue: any) => void;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, elementDesc: IFormMapDesc, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);
    this.inline = this.elementDesc.options.inlineForm;
  }

  private updateBadge() {
    const dependent = (this.elementDesc.dependsOn || []).map((id) => this.form.getElementById(id));
    Promise.resolve(this.elementDesc.options.badgeProvider(this.value, ...dependent)).then((text) => {
      this.$inputNode
        .select('span.badge')
        .html(text)
        .attr('title', I18nextManager.getInstance().i18n.t('tdp:core.FormMap.badgeTitle', { text }) as string);
    });
  }

  private get sessionKey() {
    return `formBuilder.map.${this.id}${this.elementDesc.options.sessionKeySuffix || ''}`;
  }

  protected updateStoredValue() {
    if (!this.elementDesc.useSession) {
      return;
    }
    UserSession.getInstance().store(this.sessionKey, this.value);
  }

  protected getStoredValue<T>(defaultValue: T): T {
    if (!this.elementDesc.useSession) {
      return defaultValue;
    }
    return UserSession.getInstance().retrieve(this.sessionKey, defaultValue);
  }

  /**
   * Build the label and input element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3.Selection<any>) {
    this.addChangeListener();

    this.$rootNode = $formNode.append('div').classed(this.inline ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
    this.$inputNode = this.$rootNode.append('div');
    this.setVisible(this.elementDesc.visible);

    if (this.inline && this.elementDesc.onChange) {
      // change the default onChange handler for the inline cas
      this.inlineOnChange = this.elementDesc.onChange;
      this.elementDesc.onChange = null;
    }

    // do not add the class in inline mode
    this.$inputNode.classed('row', !this.inline);

    if (this.inline) {
      if (!this.elementDesc.options.badgeProvider) {
        // default badge provider for inline
        this.elementDesc.options.badgeProvider = (rows) => (rows.length === 0 ? '' : rows.length.toString());
      }

      this.$inputNode.classed('dropdown', true);

      this.$inputNode.html(`
          <button class="btn bg-white border border-gray-400 border-1 dropdown-toggle" type="button" id="${
            this.elementDesc.attributes.id
          }l" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
            ${this.elementDesc.label}
            <span class="badge rounded-pill bg-secondary"></span>
            <span class="caret"></span>
          </button>
          <div class="dropdown-menu p-2" data-bs-popper="static" aria-labelledby="${this.elementDesc.attributes.id}l" style="min-width: 25em">
            <div class="form-map-container"></div>
            <div class="form-map-apply mt-3">
                <button class="btn btn-secondary btn-sm">${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.apply')}</button>
            </div>
          </div>
      `);

      this.$inputNode.select('.form-map-apply button').on('click', () => {
        (<MouseEvent>d3event).preventDefault();
      });

      this.$group = this.$inputNode.select('div.form-map-container');
      this.$group.on('click', () => {
        // stop click propagation to avoid closing the dropdown
        (<MouseEvent>d3event).stopPropagation();
      });
    } else {
      if (!this.elementDesc.hideLabel) {
        const $label = this.$inputNode.append('label').classed('form-label', true).attr('for', this.elementDesc.attributes.id);
        if (this.elementDesc.options.badgeProvider) {
          $label.html(`${this.elementDesc.label} <span class="badge rounded-pill bg-secondary"></span>`);
        } else {
          $label.text(this.elementDesc.label);
        }
      }

      this.$group = this.$inputNode.append('div');
    }

    this.setAttributes(this.$group, this.elementDesc.attributes);
    // adapt default settings
    this.$group.classed('form-map-container', true).classed('form-control', false); // remove form-control class to be complient with Bootstrap 4
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    this.rows = this.getStoredValue([]);
    this.previousValue = this.value;

    if (this.elementDesc.options.badgeProvider) {
      this.updateBadge();
      this.on('change', () => {
        this.updateBadge();
      });
    }

    this.handleDependent(() => {
      this.rows = []; // clear old
      this.buildMap();
      if (this.elementDesc.options.badgeProvider) {
        this.updateBadge();
      }
    });

    this.buildMap();

    if (this.inline && this.inlineOnChange) {
      // trigger change on onChange listener just when the dialog is closed
      $(this.$inputNode.node()).on('hidden.bs.dropdown', () => {
        const v = this.value;
        const previous = this.previousValue;
        if (this.isEqual(v, previous)) {
          return;
        }
        this.previousValue = v;
        this.inlineOnChange(this, v, AFormElement.toData(v), previous);
      });
    }

    {
      const v = this.value;
      if (v.length > 0) {
        this.fire(FormMap.EVENT_INITIAL_VALUE, v, []);
      }
    }
  }

  private addValueEditor(row: IFormRow, parent: Element, entries: ISubDescs[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const desc = entries.find((d) => d.value === row.key);
    const defaultSelection = this.elementDesc.options.defaultSelection !== false;

    function mapOptions(d: any | string) {
      const value = typeof d === 'string' || !d ? d : d.value || d.id;
      const name = typeof d === 'string' || !d ? d : d.name || d.text;
      return `<option value="${value}">${name}</option>`;
    }

    const initialValue = row.value;

    switch (desc.type) {
      case FormElementType.SELECT:
        parent.insertAdjacentHTML('afterbegin', `<select class="form-control from-control-sm" style="width: 100%"></select>`);
        // register on change listener
        parent.firstElementChild.addEventListener('change', function (this: HTMLSelectElement) {
          row.value = this.value;
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        });
        FormSelect.resolveData(desc.optionsData)([]).then((values: IFormSelectOption[]) => {
          parent.firstElementChild.innerHTML =
            (!defaultSelection ? `<option value="">${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.selectMe')}</option>` : '') +
            values.map(mapOptions).join('');
          if (initialValue) {
            (<HTMLSelectElement>parent.firstElementChild).selectedIndex = values.map((d) => (typeof d === 'string' ? d : d.value)).indexOf(initialValue);
          } else if (defaultSelection) {
            const first = values[0];
            row.value = typeof first === 'string' || !first ? first : first.value;
          }
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        });
        break;
      case FormElementType.SELECT2:
        parent.insertAdjacentHTML('afterbegin', `<select class="form-control form-control-sm" style="width: 100%"></select>`);

        FormSelect.resolveData(desc.optionsData)([]).then((values: IFormSelectOption[]) => {
          const initially = initialValue ? (Array.isArray(initialValue) ? initialValue : [initialValue]).map((d) => (typeof d === 'string' ? d : d.id)) : [];
          // in case of ajax but have default value
          if (desc.ajax && values.length === 0 && initialValue) {
            values = Array.isArray(initialValue) ? initialValue : [initialValue];
          }
          parent.firstElementChild.innerHTML = values.map(mapOptions).join('');
          const s = parent.firstElementChild;
          const $s = <any>$(s);
          // merge only the default options if we have no local data
          $s.select2(merge({}, desc.ajax ? FormSelect2.DEFAULT_AJAX_OPTIONS : FormSelect2.DEFAULT_OPTIONS, desc));
          if (initialValue) {
            $s.val(initially).trigger('change');
          } else if (!defaultSelection && that.elementDesc.options.uniqueKeys) {
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
                row.value = data.map((r) => ({ id: r.id, text: r.text }));
              }
              if (row.value.length === 1) {
                row.value = row.value[0];
              }
            }
            that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
          });
        });
        break;
      case FormElementType.SELECT3: {
        const select3 = new Select3(desc);
        parent.appendChild(select3.node);
        if (initialValue) {
          select3.value = Array.isArray(initialValue) ? initialValue : [initialValue];
        } else if (!defaultSelection && that.elementDesc.options.uniqueKeys) {
          select3.value = [];
        }
        that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        select3.on(Select3.EVENT_SELECT, (evt, prev: IdTextPair[], next: IdTextPair[]) => {
          row.value = next;
          this.fire(FormMap.EVENT_CHANGE, next);
        });
        break;
      }
      default:
        parent.insertAdjacentHTML('afterbegin', `<input class="form-control form-control-sm" value="${initialValue || ''}">`);
        parent.firstElementChild.addEventListener('change', function (this: HTMLInputElement) {
          row.value = this.value;
          that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
        });
        that.fire(FormMap.EVENT_CHANGE, that.value, that.$group);
    }
  }

  private buildMap() {
    if (Array.isArray(this.elementDesc.options.entries)) {
      this.buildMapImpl(this.elementDesc.options.entries);
    } else {
      // function case
      const dependent = (this.elementDesc.dependsOn || []).map((id) => this.form.getElementById(id));
      const entries = this.elementDesc.options.entries(...dependent);
      this.buildMapImpl(entries);
    }
  }

  private buildMapImpl(entries: ISubDescs[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    const group = <HTMLDivElement>this.$group.node();
    group.innerHTML = ''; // remove all approach
    // filter to only valid entries
    const values = this.rows.filter((d) => !!d.key && entries.find((e) => e.value === d.key));
    // put empty row at the end
    values.push({ key: '', value: null });
    this.rows = [];

    const updateOptions = () => {
      // disable used options
      if (!this.elementDesc.options.uniqueKeys) {
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
      row.classList.add('row');
      row.classList.add('d-flex');
      row.classList.add('align-items-top');
      group.appendChild(row);
      row.innerHTML = `
        <div class="col-sm-4 form-map-row-key pe-0">
          <select class="form-select form-select-sm map-selector">
            <option value="">${I18nextManager.getInstance().i18n.t('tdp:core.FormMap.select')}</option>
            ${entries.map((o) => `<option value="${o.value}" ${o.value === d.key ? 'selected="selected"' : ''}>${o.name}</option>`).join('')}
          </select>
        </div>
        <div class="col-sm-7 form-map-row-value ps-1 pe-1"></div>
        <div class="col-sm-1 ps-0 pe-0"><button class="btn-close btn-sm" title="${I18nextManager.getInstance().i18n.t(
          'tdp:core.FormMap.remove',
        )}"></button></div>`;

      const valueElem = <HTMLElement>row.querySelector('.form-map-row-value');
      if (d.key) {
        // has value
        this.addValueEditor(d, valueElem, entries);
      } else {
        // add remove all button
      }
      row.querySelector('.btn-close').addEventListener('click', (evt: MouseEvent) => {
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
          children.splice(0, children.length - 1).forEach((c) => c.remove());
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
        if (d.key !== this.value) {
          // value changed
          if (d.key) {
            // has an old value?
            valueElem.innerHTML = '';
          } else {
            // ensure that there is an empty row
            renderRow({ key: '', value: null });
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
   * Sets the value
   * @param v
   */
  set value(v: IFormRow[]) {
    if (this.isEqual(v, this.value)) {
      return;
    }
    this.rows = v;
    this.previousValue = this.value; // force update
    this.buildMap();
    this.updateBadge();
    this.updateStoredValue();
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    // just rows with a valid key and value
    const validRows = this.rows.filter((d) => d.key && d.value !== null);

    // create copies from each row, such that the previous values don't reference to this.value
    return validRows.map((row) => ({ ...row }));
  }

  hasValue() {
    return this.value.length > 0;
  }

  focus() {
    // open dropdown
    $(this.$inputNode.select('.dropdown-menu').node()).show();
  }

  isEqual(a: IFormRow[], b: IFormRow[]) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((ai, i) => {
      const bi = b[i];
      return ai.key === bi.key && ai.value === bi.value;
    });
  }

  static convertRow2MultiMap(rows: IFormRow[]): IFormMultiMap {
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
}

export declare type IFormMultiMap = { [key: string]: any | any[] };
