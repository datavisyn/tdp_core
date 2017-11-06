/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import {Selection} from 'd3';
import {EventHandler} from 'phovea_core/src/event';
import {IFormElementDesc, IFormParent, IFormElement, IFormSerializedValues, IFormSerializedElement} from '../interfaces';
import * as session from 'phovea_core/src/session';

/**
 * Abstract form element class that is used as parent class for other form elements
 */
export abstract class AFormElement<T extends IFormElementDesc> extends EventHandler implements IFormElement {
  static readonly EVENT_CHANGE = 'change';

  readonly id: string;

  protected $node: Selection<any>;

  protected previousValue: any = null;

  /**
   * Constructor
   * @param parent
   * @param desc
   */
  constructor(protected readonly parent: IFormParent, protected readonly desc: T) {
    super();
    this.id = desc.id;
  }

  protected updateStoredValue() {
    if (!this.desc.useSession) {
      return;
    }
    session.store(`${this.id}_value`, this.value);
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.desc.useSession) {
      return defaultValue;
    }
    return session.retrieve(`${this.id}_value`, defaultValue);
  }

  isRequired() {
    return this.desc.required;
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
   * Set the visibility of an form element
   * @param visible
   */
  setVisible(visible: boolean) {
    this.$node.classed('hidden', !visible);
  }

  protected addChangeListener() {
    if (this.desc.useSession || this.desc.onChange) {
      this.on(AFormElement.EVENT_CHANGE, () => {
        this.updateStoredValue();
        if (this.desc.onChange) {
          const value = this.value;
          const old = this.previousValue;
          this.previousValue = value;
          this.desc.onChange(this, value, toData(value), old);
        }
      });
    }
  }

  protected build() {
    this.addChangeListener();

    if (this.desc.visible === false) {
      this.$node.classed('hidden', true);
    }

    if (!this.desc.hideLabel) {
      this.$node.append('label').attr('for', this.desc.attributes.id).text(this.desc.label);
    }
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

    if (this.desc.required && !this.desc.showIf) {
      // auto enable just if there is no conditional viewing
      $node.attr('required', 'required');
    }
  }

  protected handleDependent(onDependentChange?: (values: any[]) => void): any[] {
    if (!this.desc.dependsOn) {
      return [];
    }

    const showIf = this.desc.showIf;

    const dependElements = (this.desc.dependsOn || []).map((depOn) => this.parent.getElementById(depOn));

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
      this.$node.classed('hidden', !this.desc.showIf(values));
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

  abstract get serializedValue():IFormSerializedValues[];

  abstract focus();

  /**
   * Serialize the element to plain object data structure
   * @returns {IFormSerializedElement}
   */
  serialize():IFormSerializedElement {
    return {
      id: this.id,
      values: this.serializedValue
    };
  }
}

export function toData(value: any) {
  if (Array.isArray(value)) {
    return value.map(toData);
  }
  return (value != null && value.data !== undefined) ? value.data : value;
}

export default AFormElement;
