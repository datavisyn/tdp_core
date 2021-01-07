/**
 * Plain HTML button with a custom title, CSS class and an onClick function
 */
export class PanelButton {
    /**
     * Constructor of the PanelButton
     * @param parent The parent HTML DOM element
     * @param title String that is used for the title attribute
     * @param linkClass CSS classes to apply
     * @param onClick Function that should be executed on button click
     */
    constructor(parent, title, linkClass, onClick) {
        this.node = parent.ownerDocument.createElement('button');
        this.node.className = linkClass;
        this.node.title = title;
        this.node.addEventListener('click', (evt) => {
            evt.stopPropagation();
            evt.preventDefault();
            onClick();
        });
    }
}
/**
 * HTML button with a custom title, CSS class, an onClick function
 * Acts as tab header/button and highlights itself when clicked depending on if the tab body is open or closed
 */
export class PanelNavButton {
    /**
     * Constructor of the PanelButton
     * @param parent The parent HTML DOM element
     * @param onClick Function that should be executed on button click
     * @param options Options to customize the PanelNavButton
     */
    constructor(parent, onClick, options) {
        this.node = parent.ownerDocument.createElement('li');
        this.order = options.order;
        this.node.innerHTML = `<a role="tab" title="${options.title}" data-toggle="tab"><i class="fas ${options.cssClass}"> </i>&nbsp;<span>${options.title || ''}</span></a>`;
        this.node.querySelector('a').addEventListener('click', (evt) => {
            evt.preventDefault();
            onClick();
        });
    }
    /**
     * Set the active class to this button
     * @param isActive Toggle the class
     */
    setActive(isActive) {
        this.node.classList.toggle('active', isActive);
    }
    /**
     * Trigger click event on anchor element.
     */
    click() {
        this.node.querySelector('a').click();
    }
}
//# sourceMappingURL=PanelButton.js.map