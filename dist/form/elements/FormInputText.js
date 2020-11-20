/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import { AFormElement } from './AFormElement';
export class FormInputText extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, parentElement, elementDesc, pluginDesc) {
        super(form, elementDesc, pluginDesc);
        this.pluginDesc = pluginDesc;
        this.node = parentElement.ownerDocument.createElement('div');
        this.node.classList.add('form-group');
        parentElement.appendChild(this.node);
        this.build();
    }
    /**
     * Build the label and input element
     */
    build() {
        super.build();
        this.input = this.node.ownerDocument.createElement('input');
        this.input.setAttribute('type', (this.elementDesc.options || {}).type || 'text');
        this.node.appendChild(this.input);
        this.setAttributes(this.input, this.elementDesc.attributes);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        if ((this.elementDesc.options || {}).type === 'number' && (this.elementDesc.options || {}).step) {
            this.input.setAttribute('step', this.elementDesc.options.step);
        }
        const defaultValue = (this.elementDesc.options || {}).type === 'number' ? '0' : '';
        const defaultText = this.getStoredValue(defaultValue);
        this.previousValue = defaultText;
        this.input.value = defaultText;
        if (this.hasStoredValue()) {
            this.fire(FormInputText.EVENT_INITIAL_VALUE, defaultText, defaultValue);
        }
        this.handleDependent();
        // propagate change action with the data of the selected option
        this.input.addEventListener('change.propagate', () => {
            this.fire(FormInputText.EVENT_CHANGE, this.value, this.input);
        });
    }
    /**
     * Returns the value
     * @returns {string}
     */
    get value() {
        return this.input.value;
    }
    /**
     * Sets the value
     * @param v
     */
    set value(v) {
        this.input.value = v;
        this.previousValue = v; // force old value change
        this.updateStoredValue();
    }
    focus() {
        this.input.focus();
    }
}
//# sourceMappingURL=FormInputText.js.map