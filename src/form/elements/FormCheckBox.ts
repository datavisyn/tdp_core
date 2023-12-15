import * as d3v3 from 'd3v3';
import { IPluginDesc } from 'visyn_core/plugin';
import { IFormElementDesc, IForm, FormElementType } from '../interfaces';
import { AFormElement } from './AFormElement';

export interface ICheckBoxElementDesc extends IFormElementDesc {
  type: FormElementType.CHECKBOX;
  options: {
    /**
     * checked value
     */
    checked?: any;
    /**
     * unchecked value
     */
    unchecked?: any;
    /**
     * default value
     */
    isChecked?: any;
  } & IFormElementDesc['options'];
}

export class FormCheckBox extends AFormElement<ICheckBoxElementDesc> {
  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(
    form: IForm,
    elementDesc: ICheckBoxElementDesc,
    readonly pluginDesc: IPluginDesc,
  ) {
    super(form, { options: { checked: true, unchecked: false }, ...elementDesc }, pluginDesc);
  }

  /**
   * Build the label and input element
   * @param $formNode The parent node this element will be attached to
   */
  build($formNode: d3v3.Selection<any>) {
    this.addChangeListener();

    this.$rootNode = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-2 mb-1', true);
    const formCheckNode = this.$rootNode.append('div').classed(`form-check`, true);
    this.setVisible(this.elementDesc.visible);

    this.$inputNode = formCheckNode.append('input').classed('form-check-input', true).attr('type', 'checkbox').attr('data-testid', 'form-checkbox').order();
    // ensure correct order of input and label tags
    this.appendLabel(formCheckNode);

    this.setAttributes(this.$inputNode, this.elementDesc.attributes);
  }

  /**
   * Bind the change listener and propagate the selection by firing a change event
   */
  init() {
    super.init();

    const { options } = this.elementDesc;
    const isChecked: boolean = options.isChecked != null ? options.isChecked : this.getStoredValue(options.unchecked) === options.checked;
    this.previousValue = isChecked;
    this.$inputNode.property('checked', isChecked);
    if (this.hasStoredValue()) {
      // trigger if we have a stored value
      // TODO: using the new value `isChecked` may be wrong, because it's of type boolean and options.checked and options.unchecked could be anything --> this.getStoredValue(...) should probably be used instead
      this.fire(FormCheckBox.EVENT_INITIAL_VALUE, isChecked, options.unchecked); // store initial values as actions with results in the provenance graph
    }

    this.handleDependent();

    // propagate change action with the data of the selected option
    this.$inputNode.on('change.propagate', () => {
      this.fire(FormCheckBox.EVENT_CHANGE, this.value, this.$inputNode);
    });
  }

  /**
   * Returns the value
   * @returns {string}
   */
  get value() {
    const { options } = this.elementDesc;
    return this.$inputNode.property('checked') ? options.checked : options.unchecked;
  }

  /**
   * Sets the value
   * @param v
   */
  set value(v: any) {
    const { options } = this.elementDesc;
    this.$inputNode.property('value', v === options.checked);
    this.previousValue = v === options.checked; // force old value change
    this.updateStoredValue();
  }

  focus() {
    (<HTMLInputElement>this.$inputNode.node()).focus();
  }
}
