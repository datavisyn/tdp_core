import { AFormElement } from './AFormElement';
export class FormCheckBox extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super(form, Object.assign({ options: { checked: true, unchecked: false } }, elementDesc), pluginDesc);
        this.pluginDesc = pluginDesc;
    }
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.addChangeListener();
        const formInline = 'formInline';
        this.$node = $formNode.append('div').classed(`form-check checkbox col-sm-auto ${(this.form[formInline]) ? '' : 'mt-3'}`, true);
        this.setVisible(this.elementDesc.visible);
        const $label = this.$node.select('label');
        if ($label.length === 0) {
            this.$input = this.$node.append('input').classed('form-check-input position-static', true).attr('type', 'checkbox');
        }
        else {
            this.$input = this.$node.append('input').classed('form-check-input', true).attr('type', 'checkbox').order();
            $label.classed('form-check-label', true);
            // ensure correct order of input and label tags
            this.appendLabel();
        }
        this.setAttributes(this.$input, this.elementDesc.attributes);
        this.$input.classed('form-control', false); //remove falsy class again
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        const options = this.elementDesc.options;
        const isChecked = options.isChecked != null ? options.isChecked : this.getStoredValue(options.unchecked) === options.checked;
        this.previousValue = isChecked;
        this.$input.property('checked', isChecked);
        if (this.hasStoredValue()) { // trigger if we have a stored value
            // TODO: using the new value `isChecked` may be wrong, because it's of type boolean and options.checked and options.unchecked could be anything --> this.getStoredValue(...) should probably be used instead
            this.fire(FormCheckBox.EVENT_INITIAL_VALUE, isChecked, options.unchecked); // store initial values as actions with results in the provenance graph
        }
        this.handleDependent();
        // propagate change action with the data of the selected option
        this.$input.on('change.propagate', () => {
            this.fire(FormCheckBox.EVENT_CHANGE, this.value, this.$input);
        });
    }
    /**
     * Returns the value
     * @returns {string}
     */
    get value() {
        const options = this.elementDesc.options;
        return this.$input.property('checked') ? options.checked : options.unchecked;
    }
    /**
     * Sets the value
     * @param v
     */
    set value(v) {
        const options = this.elementDesc.options;
        this.$input.property('value', v === options.checked);
        this.previousValue = v === options.checked; // force old value change
        this.updateStoredValue();
    }
    focus() {
        this.$input.node().focus();
    }
}
//# sourceMappingURL=FormCheckBox.js.map