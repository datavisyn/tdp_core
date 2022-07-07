import * as d3v3 from 'd3v3';
import { EventHandler } from '../../base';
export class FormButton extends EventHandler {
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
        this.clicked = false;
        this.id = elementDesc.id;
    }
    /**
     * Set the visibility of an form element - needed by IFormElement
     * @param visible
     */
    setVisible(visible) {
        this.$node.attr('hidden', !visible);
    }
    get value() {
        return this.clicked;
    }
    set value(clicked) {
        this.clicked = clicked;
    }
    validate() {
        return true;
    }
    /**
     * Build the current element and add the DOM element to the form DOM element.
     * @param $formNode The parent node this element will be attached to
     */
    build($formNode) {
        this.$node = $formNode.append('div').classed(this.elementDesc.options.inlineForm ? 'col-sm-auto' : 'col-sm-12 mt-1 mb-1', true);
        this.$button = this.$node.append('button').classed(this.elementDesc.attributes.clazz, true);
        this.$button.html(() => (this.elementDesc.iconClass ? `<i class="${this.elementDesc.iconClass}"></i> ${this.elementDesc.label}` : this.elementDesc.label));
    }
    init() {
        this.$button.on('click', () => {
            this.value = true;
            this.elementDesc.onClick();
            d3v3.event.preventDefault();
            d3v3.event.stopPropagation();
        });
        // TODO doesn't support show if
    }
    focus() {
        this.$button.node().focus();
    }
}
//# sourceMappingURL=FormButton.js.map