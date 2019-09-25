/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import {Selection} from 'd3';
import {EventHandler} from 'phovea_core/src/event';
import {IFormElementDesc, IForm, IFormElement} from '../interfaces';
import * as session from 'phovea_core/src/session';
import {IPluginDesc} from 'phovea_core/src/plugin';

/**
 * Abstract form element class that is used as parent class for other form elements
 */
export abstract class AFormElement<T extends IFormElementDesc> extends EventHandler implements IFormElement {
  static readonly EVENT_CHANGE = 'change';
  static readonly EVENT_INITIAL_VALUE = 'initial';

  readonly id: string;

  protected $node: Selection<any>;

  protected previousValue: any = null;

  /**
   * Constructor
   * @param form The form this element is a part of
   * @param elementDesc The form element description
   * @param pluginDesc The phovea extension point description
   */
  constructor(protected readonly form: IForm, protected readonly elementDesc: T, protected readonly pluginDesc: IPluginDesc) {
    super();
    this.id = elementDesc.id;

    if (elementDesc.onInit) {
      this.on(AFormElement.EVENT_INITIAL_VALUE, (_evt, value: any, previousValue: any) => {
        elementDesc.onInit(this, value, toData(value), previousValue);
      });
    }
  }

  protected updateStoredValue() {
    if (!this.elementDesc.useSession) {
      return;
    }
    session.store(`${this.id}_value`, this.value);
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.elementDesc.useSession) {
      return defaultValue;
    }
    return session.retrieve(`${this.id}_value`, defaultValue);
  }

  protected hasStoredValue(): boolean {
    return session.has(`${this.id}_value`);
  }

  isRequired() {
    return this.elementDesc.required;
  }

  validate() {
    if (!this.isVisible() || !this.isRequired()) {
      return true;
    }
    const v = this.hasValue();
    this.$node.classed('has-error', !v);
    return v;
  }

  protected hasValue() {
    return Boolean(this.value);
  }

  isVisible() {
    return !this.$node.classed('hidden');
  }

  /**
   * Set the visibility of an form element (default = true)
   * @param visible
   */
  setVisible(visible: boolean = true) {
    this.$node.classed('hidden', !visible);
  }

  protected addChangeListener() {
    if (this.elementDesc.useSession || this.elementDesc.onChange) {
      this.on(AFormElement.EVENT_CHANGE, () => {
        this.updateStoredValue();
        this.triggerValueChanged();
      });
    }
  }

  protected triggerValueChanged() {
    if (!this.elementDesc.onChange) {
      return;
    }
    const value = this.value;
    const old = this.previousValue;
    this.previousValue = value;
    this.elementDesc.onChange(this, value, toData(value), old);
  }

  /**
   * Build the current element and add the DOM element to the form DOM element.
   * The implementation of this function must set the `$node` property!
   */
  abstract build($formNode: Selection<any>);

  /**
   * Initialize dependent form fields, bind the change listener, and propagate the selection by firing a change event
   */
  init() {
    // hook
  }

  /**
   * Append a label to the node element if `hideLabel = false` in the element description
   */
  protected appendLabel() {
    if (this.elementDesc.hideLabel) {
      return;
    }
    this.$node.append('label').attr('for', this.elementDesc.attributes.id).text(this.elementDesc.label);
  }

  /**
   * Set a list of object properties and values to a given node
   * Note: Use `clazz` instead of the attribute `class` (which is a reserved keyword in JavaScript)
   * @param $node
   * @param attributes Plain JS object with key as attribute name and the value as attribute value
   */
  protected setAttributes($node: Selection<any>, attributes: {[key: string]: any}) {
    if (!attributes) {
      return;
    }

    Object.keys(attributes).forEach((key) => {
      $node.attr((key === 'clazz') ? 'class' : key, attributes[key]);
    });

    if (this.elementDesc.required && !this.elementDesc.showIf) {
      // auto enable just if there is no conditional viewing
      $node.attr('required', 'required');
    }
  }

  protected handleDependent(onDependentChange?: (values: any[]) => void): any[] {
    if (!this.elementDesc.dependsOn) {
      return [];
    }

    const showIf = this.elementDesc.showIf;

    const dependElements = (this.elementDesc.dependsOn || []).map((depOn) => this.form.getElementById(depOn));

    dependElements.forEach((depElem) => {
      depElem.on(AFormElement.EVENT_CHANGE, () => {
        const values = dependElements.map((d) => d.value);
        if(onDependentChange) {
          onDependentChange(values);
        }
        if (showIf) {
          this.$node.classed('hidden', !showIf(values));
        }
      });
    });

    // initial values
    const values = dependElements.map((d) => d.value);
    if (showIf) {
      this.$node.classed('hidden', !this.elementDesc.showIf(values));
    }
    return values;
  }

  /**
   * Returns the form element value
   * @returns {string}
   */
  abstract get value();

  /**
   * Set the form element value
   * @param v
   */
  abstract set value(v: any);

  abstract focus();
}

export function toData(value: any) {
  if (Array.isArray(value)) {
    return value.map(toData);
  }
  return (value != null && value.data !== undefined) ? value.data : value;
}

export default AFormElement;
