import { Selection } from 'd3v3';
import { PluginRegistry, IPluginDesc } from 'visyn_core/plugin';
import { UserSession } from 'visyn_core/security';
import { EventHandler } from 'visyn_core/base';
import { EP_TDP_CORE_FORM_ELEMENT } from '../../base/extensions';
import { IFormElementDesc, IForm, IFormElement, FormElementType } from '../interfaces';

/**
 * Abstract form element class that is used as parent class for other form elements
 */
export abstract class AFormElement<T extends IFormElementDesc> extends EventHandler implements IFormElement {
  static readonly EVENT_CHANGE = 'change';

  static readonly EVENT_INITIAL_VALUE = 'initial';

  readonly id: string;

  protected $rootNode: Selection<any>;

  protected $inputNode: Selection<any> | null;

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

  protected getStoredValue<D>(defaultValue: D): D {
    if (!this.elementDesc.useSession) {
      return defaultValue;
    }
    return UserSession.getInstance().retrieve(`${this.id}_value`, defaultValue);
  }

  protected hasStoredValue(): boolean {
    return UserSession.getInstance().retrieve(`${this.id}_value`) != null;
  }

  isRequired() {
    return this.elementDesc.required;
  }

  validate() {
    if (!this.isVisible() || !this.isRequired()) {
      return true;
    }
    const v = this.hasValue();
    this.$inputNode?.classed('is-invalid', !v);
    return v;
  }

  protected hasValue() {
    return Boolean(this.value);
  }

  isVisible() {
    return this.$rootNode.attr('hidden') === null;
  }

  /**
   * Set the visibility of an form element (default = true)
   * @param visible
   */
  setVisible(visible = true) {
    this.$rootNode.attr('hidden', visible ? null : '');
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
    const { value } = this;
    const old = this.previousValue;
    this.previousValue = value;
    this.elementDesc.onChange(this, value, AFormElement.toData(value), old);
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
  protected appendLabel($node: Selection<any>): Selection<any> {
    if (this.elementDesc.hideLabel) {
      return undefined;
    }
    const colWidth = this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12';
    // TODO: Better move this logic to the corresponding class, i.e. FormCheckbox.
    const labelClass = this.elementDesc.type === FormElementType.CHECKBOX ? 'form-check-label' : 'col-form-label';
    return $node
      .append('label')
      .classed(`${labelClass} ${colWidth}`, true)
      .attr('for', this.elementDesc.attributes.id)
      .attr('data-testid', this.elementDesc.label)
      .text(this.elementDesc.label);
  }

  /**
   * Set a list of object properties and values to a given node
   * Note: Use `clazz` instead of the attribute `class` (which is a reserved keyword in JavaScript)
   * @param $node
   * @param attributes Plain JS object with key as attribute name and the value as attribute value
   */
  protected setAttributes($node: Selection<any>, attributes: { [key: string]: any }) {
    if (!attributes) {
      return;
    }

    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'clazz': {
          const cssClasses = attributes[key].split(' '); // tokenize CSS classes at space
          cssClasses.forEach((cssClass) => $node.classed(cssClass, true));
          break;
        }
        default:
          $node.attr(key, attributes[key]);
          break;
      }
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

    const { showIf } = this.elementDesc;

    const dependElements = (this.elementDesc.dependsOn || []).map((depOn) => this.form.getElementById(depOn));

    dependElements.forEach((depElem) => {
      depElem.on(AFormElement.EVENT_CHANGE, () => {
        const values = dependElements.map((d) => d.value);
        if (onDependentChange) {
          onDependentChange(values);
        }
        if (showIf) {
          this.setVisible(showIf(values));
        }
      });
    });

    // initial values
    const values = dependElements.map((d) => d.value);
    if (showIf) {
      this.setVisible(this.elementDesc.showIf(values));
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
    return value != null && value.data !== undefined ? value.data : value;
  }

  /**
   * Factory method to create form elements for the phovea extension type `tdpFormElement`.
   * An element is found when `desc.type` is matching the extension id.
   *
   * @param form the form to which the element will be appended
   * @param $parent parent D3 selection element
   * @param elementDesc form element description
   */
  static createFormElement(form: IForm, elementDesc: IFormElementDesc): Promise<IFormElement> {
    const plugin = PluginRegistry.getInstance().getPlugin(EP_TDP_CORE_FORM_ELEMENT, elementDesc.type);
    if (!plugin) {
      throw new Error(`unknown form element type: ${elementDesc.type}`);
    }
    return plugin.load().then((p) => {
      return p.factory(form, <any>elementDesc, p.desc);
    });
  }
}
