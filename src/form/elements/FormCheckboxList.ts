import * as $ from 'jquery';
import AFormElement, {toData} from 'tdp_core/src/form/elements/AFormElement';
import {IFormElementDesc, IForm, FormElementType} from 'tdp_core/src/form/interfaces';
import {mixin} from 'phovea_core/src';
import {IFormElement} from 'tdp_core/src/form';
import * as session from 'phovea_core/src/session';
import {resolveImmediately} from 'phovea_core/src';
import {IPluginDesc} from 'phovea_core/src/plugin';

export interface IFormListItem<T> {
  id: string;
  value: boolean;
  label: string;
  initialValue: boolean;
}

/**
 * Add specific options for input form elements
 */
export interface IFormListDesc<T> extends IFormElementDesc {
  /**
   * Additional options
   */
  options?: {
    entries: IFormListItem<T>[]

    sessionKeySuffix?: string;
  };
}


// TODO: is the clue command when changing a parameter even called? --> try with another parameter, e.g. Select

export default class FormCheckboxList<T> extends AFormElement<IFormListDesc<T>> {

  private $group: d3.Selection<any>;

  private inlineOnChange: (formElement: IFormElement, value: any, data: any, previousValue: any)=>void;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(form: IForm, elementDesc: IFormListDesc<T>, readonly pluginDesc: IPluginDesc) {
    super(form, elementDesc, pluginDesc);
  }

  private updateBadge() {
    // TODO show how many of the checkboxes are ticked --> what if radio buttons are rendered? --> move to child class

    // const dependent = (this.elementDesc.dependsOn || []).map((id) => this.form.getElementById(id));

    // resolveImmediately(this.elementDesc.options.badgeProvider(this.value, ...dependent)).then((text) => {
    //   this.$node.select('span.badge').html(text).attr('title', `${text} items remaining after filtering`);
    // });
  }

  private get sessionKey() {
    return `formBuilder.list.${this.id}${this.elementDesc.options.sessionKeySuffix || ''}`;
  }

  protected updateStoredValue() {
    if (!this.elementDesc.useSession) {
      return;
    }
    session.store(this.sessionKey, this.value);
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.elementDesc.useSession) {
      return defaultValue;
    }
    return session.retrieve(this.sessionKey, defaultValue);
  }

  /**
   * Build the label and input element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3.Selection<any>) {
    this.addChangeListener();

    this.$node = $formNode.append('div').classed('form-group', true);
    this.setVisible(this.elementDesc.visible);


    this.$node.classed('dropdown', true);
    this.$node.html(`
        <button class="btn btn-default dropdown-toggle" type="button" id="${this.elementDesc.attributes.id}l" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
          ${this.elementDesc.label}
          <span class="badge"></span>
          <span class="caret"></span>
        </button>
        <div class="dropdown-menu" aria-labelledby="${this.elementDesc.attributes.id}l" style="padding: 0.5em">
          <div class="form-list"></div>
          <div>
              <button class="btn btn-default btn-sm right">Apply</button>
          </div>
        </div>
    `);
    this.$group = this.$node.select('div.form-list');
    this.setAttributes(this.$group, this.elementDesc.attributes);
    // adapt default settings
    this.$group.classed('form-list', true).classed('form-control', false).classed('form-group-sm', true);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    this.previousValue = this.value;

    // TODO update badge
    // if (this.elementDesc.options.badgeProvider) {
    //   this.updateBadge();
    //   this.on('change', () => {
    //     this.updateBadge();
    //   });
    // }

    this.buildList();

    if (this.elementDesc.onChange) {
      // trigger change on onChange listener just when the dialog is closed
      $(this.$node.node()).on('hidden.bs.dropdown', () => {
        const v = this.value;
        const previous = this.previousValue;

        // TODO early abort
        // if (isEqual(v, previous)) {
        //   return;
        // }
        this.previousValue = v;
        this.elementDesc.onChange(this, v, toData(v), previous);
      });
    }

    {
      const v = this.value;
      if (v.length > 0) {
        this.fire(FormCheckboxList.EVENT_INITIAL_VALUE, v, []);
      }
    }
  }

  private addValueEditor(entry: IFormListItem<T>, parent: Element, entries: IFormListItem<T>[]) {
    const that = this;

    // TODO defaultSelection needed?
    // const defaultSelection = this.elementDesc.options.defaultSelection !== false;

    const initialValue = entry.initialValue;

    // TODO move to child class
    parent.insertAdjacentHTML('afterbegin', `<label for="${entry.id}">${entry.label}</label><input id="${entry.id}" type="checkbox" checked="${initialValue === true || null}">`);
    parent.firstElementChild.addEventListener('change', function (this: HTMLInputElement) {
      // row.value = this.value;
      that.fire(FormCheckboxList.EVENT_CHANGE, that.value, that.$group);
    });
    that.fire(FormCheckboxList.EVENT_CHANGE, that.value, that.$group);
  }

  private buildList() {
    this.buildListImpl(this.elementDesc.options.entries);
  }

  private buildListImpl(entries: IFormListItem<T>[]) {
    entries.forEach((entry) => {
      this.addValueEditor(entry, <HTMLElement>this.$group.node(), entries);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    // just rows with a valid key and value
    // const validRows = this.rows.filter((d) => d.key && d.value !== null);

    // create copies from each row, such that the previous values don't reference to this.value
    // return validRows.map((row) => Object.assign({}, row));

    const elements = (<HTMLElement>this.$group.node()).querySelectorAll<HTMLInputElement>('input[type=checkbox]');

    const values = Array.from(elements).map<[string, boolean]>((element) => [element.id, Boolean(element.value)]);

    return values;

  }

  hasValue() {
    return this.value.length > 0;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: [string, boolean][]) {
    const elements = (<HTMLElement>this.$group.node()).querySelectorAll<HTMLInputElement>('input[type=checkbox]');

    v.forEach((value) => {
      const changedElement = Array.from(elements).find((element) => element.id === value[0]);
      changedElement.value = String(value[1]);
    });


    // this.rows = v;
    // this.previousValue = this.value; // force update
    // this.buildMap();
    this.updateBadge();
    this.updateStoredValue();
  }

  focus() {
    // open dropdown
    $(this.$node.select('.dropdown-menu').node()).show();
  }
}
