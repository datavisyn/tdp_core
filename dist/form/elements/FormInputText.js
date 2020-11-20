/**
 * Created by Samuel Gratzl on 08.03.2017.
 */
import { AFormElement } from './AFormElement';
export class FormInputText extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super(form, elementDesc, pluginDesc);
        this.pluginDesc = pluginDesc;
    }
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.addChangeListener();
        this.$node = $formNode.append('div').classed('form-group', true);
        this.setVisible(this.elementDesc.visible);
        this.appendLabel();
        this.$input = this.$node.append('input').attr('type', (this.elementDesc.options || {}).type || 'text');
        this.setAttributes(this.$input, this.elementDesc.attributes);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        if ((this.elementDesc.options || {}).type === 'number' && (this.elementDesc.options || {}).step) {
            this.$input.attr('step', this.elementDesc.options.step);
        }
        const defaultValue = (this.elementDesc.options || {}).type === 'number' ? '0' : '';
        const defaultText = this.getStoredValue(defaultValue);
        this.previousValue = defaultText;
        this.$input.property('value', defaultText);
        if (this.hasStoredValue()) {
            this.fire(FormInputText.EVENT_INITIAL_VALUE, defaultText, defaultValue);
        }
        this.handleDependent();
        // propagate change action with the data of the selected option
        this.$input.on('change.propagate', () => {
            this.fire(FormInputText.EVENT_CHANGE, this.value, this.$input);
        });
    }
    /**
     * Returns the value
     * @returns {string}
     */
    get value() {
        return this.$input.property('value');
    }
    /**
     * Sets the value
     * @param v
     */
    set value(v) {
        this.$input.property('value', v);
        this.previousValue = v; // force old value change
        this.updateStoredValue();
    }
    focus() {
        this.$input.node().focus();
    }
}
//# sourceMappingURL=FormInputText.js.map