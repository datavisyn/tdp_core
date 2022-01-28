import { AFormElement } from './AFormElement';
export class FormRadio extends AFormElement {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, elementDesc, pluginDesc) {
        super(form, { options: { buttons: [] }, ...elementDesc }, pluginDesc);
        this.pluginDesc = pluginDesc;
    }
    /**
     * Build the label and input element
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.addChangeListener();
        this.$rootNode = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
        this.setVisible(this.elementDesc.visible);
        const $label = this.appendLabel(this.$rootNode);
        $label.classed('me-2', true);
        const { options } = this.elementDesc;
        const $buttons = this.$rootNode.selectAll('div.radio-inline').data(options.buttons);
        $buttons
            .enter()
            .append('div')
            .classed('radio-inline form-check form-check-inline', true)
            .html((d, i) => `<input class="form-check-input" type="radio"
        name="${this.id}" id="${this.id}${i === 0 ? '' : i}" value="${d.value}">
      <label class="form-label form-check-label" for="${this.id}${i === 0 ? '' : i}"> ${d.name}</label>`);
        this.$inputNode = $buttons.select('input');
        this.$inputNode.on('change', (d) => {
            this.fire(FormRadio.EVENT_CHANGE, d, $buttons);
        });
        // TODO: fix that the form-control class is only appended for textual form elements, not for all
        this.elementDesc.attributes.clazz = this.elementDesc.attributes.clazz.replace('form-control', ''); // filter out the form-control class, because it is mainly used for text inputs and destroys the styling of the radio
        this.setAttributes(this.$inputNode, this.elementDesc.attributes);
    }
    /**
     * Bind the change listener and propagate the selection by firing a change event
     */
    init() {
        super.init();
        const { options } = this.elementDesc;
        const defaultOption = options.buttons[0].data;
        const defaultValue = this.getStoredValue(defaultOption);
        this.value = defaultValue;
        this.previousValue = defaultValue;
        if (this.hasStoredValue()) {
            this.fire(FormRadio.EVENT_INITIAL_VALUE, this.value, defaultOption);
        }
        this.handleDependent();
    }
    /**
     * Returns the value
     * @returns {string}
     */
    get value() {
        const checked = this.$rootNode.select('input:checked');
        return checked.empty() ? null : checked.datum().data;
    }
    /**
     * Sets the value
     * @param v
     */
    set value(v) {
        this.$rootNode.selectAll('input').property('checked', (d) => d === v || d.data === v);
        this.previousValue = v; // force old value change
        this.updateStoredValue();
    }
    focus() {
        this.$rootNode.select('input').node().focus();
    }
}
//# sourceMappingURL=FormRadio.js.map