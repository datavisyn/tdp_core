import { EventHandler } from 'phovea_core';
export class FormButton extends EventHandler {
    /**
     * Constructor
     * @param form The form this element is a part of
     * @param parentElement The parent node this element will be attached to
     * @param elementDesc The form element description
     * @param pluginDesc The phovea extension point description
     */
    constructor(form, parentElement, desc, pluginDesc) {
        super();
        this.form = form;
        this.parentElement = parentElement;
        this.desc = desc;
        this.pluginDesc = pluginDesc;
        this.clicked = false;
        this.id = desc.id;
        this.node = parentElement.ownerDocument.createElement('div');
        this.node.classList.add('form-group');
        parentElement.appendChild(this.node);
        this.build();
    }
    /**
     * Set the visibility of an form element - needed by IFormElement
     * @param visible
     */
    setVisible(visible) {
        this.node.classList.toggle('hidden', !visible);
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
    build() {
        this.button = this.node.ownerDocument.createElement('button');
        this.button.classList.toggle(this.desc.attributes.clazz, true);
        this.button.innerHTML = this.desc.iconClass ? `<i class="${this.desc.iconClass}"></i> ${this.desc.label}` : this.desc.label;
        this.node.appendChild(this.button);
    }
    init() {
        this.button.addEventListener('click', (event) => {
            this.value = true;
            this.desc.onClick();
            event.preventDefault();
            event.stopPropagation();
        });
        // TODO doesn't support show if
    }
    focus() {
        this.button.focus();
    }
}
//# sourceMappingURL=FormButton.js.map