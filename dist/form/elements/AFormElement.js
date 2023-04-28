import { PluginRegistry } from 'visyn_core';
import { UserSession } from 'visyn_core';
import { EventHandler } from 'visyn_core';
import { EP_TDP_CORE_FORM_ELEMENT } from '../../base/extensions';
import { FormElementType } from '../interfaces';
/**
 * Abstract form element class that is used as parent class for other form elements
 */
class AFormElement extends EventHandler {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super();
        this.form = form;
        this.elementDesc = elementDesc;
        this.pluginDesc = pluginDesc;
        this.previousValue = null;
        this.id = elementDesc.id;
        if (elementDesc.onInit) {
            this.on(AFormElement.EVENT_INITIAL_VALUE, (_evt, value, previousValue) => {
                elementDesc.onInit(this, value, AFormElement.toData(value), previousValue);
            });
        }
    }
    updateStoredValue() {
        if (!this.elementDesc.useSession) {
            return;
        }
        UserSession.getInstance().store(`${this.id}_value`, this.value);
    }
    getStoredValue(defaultValue) {
        if (!this.elementDesc.useSession) {
            return defaultValue;
        }
        return UserSession.getInstance().retrieve(`${this.id}_value`, defaultValue);
    }
    hasStoredValue() {
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
    hasValue() {
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
    addChangeListener() {
        if (this.elementDesc.useSession || this.elementDesc.onChange) {
            this.on(AFormElement.EVENT_CHANGE, () => {
                this.updateStoredValue();
                this.triggerValueChanged();
            });
        }
    }
    triggerValueChanged() {
        if (!this.elementDesc.onChange) {
            return;
        }
        const { value } = this;
        const old = this.previousValue;
        this.previousValue = value;
        this.elementDesc.onChange(this, value, AFormElement.toData(value), old);
    }
    /**
     * Initialize dependent form fields, bind the change listener, and propagate the selection by firing a change event
     */
    init() {
        // hook
    }
    /**
     * Append a label to the node element if `hideLabel = false` in the element description
     */
    appendLabel($node) {
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
    setAttributes($node, attributes) {
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
    handleDependent(onDependentChange) {
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
    static toData(value) {
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
    static createFormElement(form, elementDesc) {
        const plugin = PluginRegistry.getInstance().getPlugin(EP_TDP_CORE_FORM_ELEMENT, elementDesc.type);
        if (!plugin) {
            throw new Error(`unknown form element type: ${elementDesc.type}`);
        }
        return plugin.load().then((p) => {
            return p.factory(form, elementDesc, p.desc);
        });
    }
}
AFormElement.EVENT_CHANGE = 'change';
AFormElement.EVENT_INITIAL_VALUE = 'initial';
export { AFormElement };
//# sourceMappingURL=AFormElement.js.map