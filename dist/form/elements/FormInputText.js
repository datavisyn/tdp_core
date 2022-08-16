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
        this.$rootNode = $formNode.append('div');
        this.setVisible(this.elementDesc.visible);
        this.appendLabel(this.$rootNode);
        this.$inputNode = this.$rootNode
            .append('input')
            .classed('form-control', true)
            .attr('type', (this.elementDesc.options || {}).type || 'text');
        this.setAttributes(this.$inputNode, this.elementDesc.attributes);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        if ((this.elementDesc.options || {}).type === 'number' && (this.elementDesc.options || {}).step) {
            this.$inputNode.attr('step', this.elementDesc.options.step);
        }
        const defaultValue = (this.elementDesc.options || {}).type === 'number' ? '0' : '';
        const defaultText = this.getStoredValue(defaultValue);
        this.previousValue = defaultText;
        this.$inputNode.property('value', defaultText);
        if (this.hasStoredValue()) {
            this.fire(FormInputText.EVENT_INITIAL_VALUE, defaultText, defaultValue);
        }
        this.handleDependent();
        // propagate change action with the data of the selected option
        this.$inputNode.on('change.propagate', () => {
            this.fire(FormInputText.EVENT_CHANGE, this.value, this.$inputNode);
        });
    }
    /**
     * Returns the value
     * @returns {string}
     */
    get value() {
        return this.$inputNode.property('value');
    }
    /**
     * Sets the value
     * @param v
     */
    set value(v) {
        this.$inputNode.property('value', v);
        this.previousValue = v; // force old value change
        this.updateStoredValue();
    }
    focus() {
        this.$inputNode.node().focus();
    }
}
//# sourceMappingURL=FormInputText.js.map