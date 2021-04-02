/**
 * Created by Samuel Gratzl on 08.03.2017.
 */

import {EventHandler, UserSession, IPluginDesc, PluginRegistry} from 'phovea_core';
import {IFormElementDesc, IForm, IFormElement} from '../interfaces';
import {EP_TDP_CORE_FORM_ELEMENT} from '../../base/extensions';

/**
 * Abstract form element class that is used as parent class for other form elements
 */
export abstract class AFormElement<T extends IFormElementDesc> extends EventHandler implements IFormElement {
  static readonly EVENT_CHANGE = 'change';
  static readonly EVENT_INITIAL_VALUE = 'initial';

  readonly id: string;

  protected node: HTMLElement;

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
        elementDesc.onInit(this, value, AFormElement.toData(value), previousValue);
      });
    }
  }

  protected updateStoredValue() {
    if (!this.elementDesc.useSession) {
      return;
    }
    UserSession.getInstance().store(`${this.id}_value`, this.value);
  }

  protected getStoredValue<T>(defaultValue:T): T {
    if (!this.elementDesc.useSession) {
      return defaultValue;
    }
    return  UserSession.getInstance().retrieve(`${this.id}_value`, defaultValue);
  }

  protected hasStoredValue(): boolean {
    return  UserSession.getInstance().has(`${this.id}_value`);
  }

  isRequired() {
    return this.elementDesc.required;
  }

  validate() {
    if (!this.isVisible() || !this.isRequired()) {
      return true;
    }
    const v = this.hasValue();
    this.node.classList.toggle('has-error', !v);
    return v;
  }

  protected hasValue() {
    return Boolean(this.value);
  }

  isVisible() {
    return !this.node.classList.toggle('hidden');
  }

  /**
   * Set the visibility of an form element
   * @param visible
   */
  setVisible(visible: boolean) {
    this.node.classList.toggle('hidden', !visible);
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
    this.elementDesc.onChange(this, value, AFormElement.toData(value), old);
  }

  protected build() {
    this.addChangeListener();

    if (this.elementDesc.visible === false) {
      this.node.classList.toggle('hidden', true);
    }

    if (!this.elementDesc.hideLabel) {
      const label = this.node.ownerDocument.createElement('label');
      label.setAttribute('for', this.elementDesc.attributes.id);
      label.innerText = this.elementDesc.label;
      this.node.appendChild(label);
    }
  }

  /**
   * Initialize dependent form fields, bind the change listener, and propagate the selection by firing a change event
   */
  init() {
    // hook
  }

  /**
   * Set a list of object properties and values to a given node
   * Note: Use `clazz` instead of the attribute `class` (which is a reserved keyword in JavaScript)
   * @param node
   * @param attributes Plain JS object with key as attribute name and the value as attribute value
   */
  protected setAttributes(node: HTMLElement, attributes: {[key: string]: any}) {
    if (!attributes) {
      return;
    }

    Object.keys(attributes).forEach((key) => {
      node.setAttribute((key === 'clazz') ? 'class' : key, attributes[key]);
    });

    if (this.elementDesc.required && !this.elementDesc.showIf) {
      // auto enable just if there is no conditional viewing
      node.setAttribute('required', 'required');
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
          this.node.classList.toggle('hidden', !showIf(values));
        }
      });
    });

    // initial values
    const values = dependElements.map((d) => d.value);
    if (showIf) {
      this.node.classList.toggle('hidden', !this.elementDesc.showIf(values));
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

  static toData(value: any) {
    if (Array.isArray(value)) {
      return value.map(AFormElement.toData);
    }
    return (value != null && value.data !== undefined) ? value.data : value;
  }

  /**
   * Factory method to create form elements for the phovea extension type `tdpFormElement`.
   * An element is found when `desc.type` is matching the extension id.
   *
   * @param form the form to which the element will be appended
   * @param parentElement parent DOM element
   * @param elementDesc form element description
   */
  static createFormElement(form: IForm, parentElement: HTMLElement, elementDesc: IFormElementDesc): Promise<IFormElement> {
    const plugin = PluginRegistry.getInstance().getPlugin(EP_TDP_CORE_FORM_ELEMENT, elementDesc.type);
    if(!plugin) {
      throw new Error('unknown form element type: ' + elementDesc.type);
    }
    return plugin.load().then((p) => {
      return p.factory(form, <any>elementDesc, p.desc);
    });
  }
}
