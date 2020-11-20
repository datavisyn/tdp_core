/**
 * The panel header contains a list of panel buttons.
 */
export class PanelHeader {
    /**
     *
     * @param parent The parent HTML DOM element.
     * @param isTopMode Is the SidePanel collapsed or not.
     */
    constructor(parent) {
        this.buttons = [];
        this.node = parent.ownerDocument.createElement('header');
        parent.appendChild(this.node);
    }
    /**
     * Add a panel button to this header
     * @param button Panel button instance to add
     */
    addButton(button) {
        this.buttons = [...this.buttons, button];
        this.node.appendChild(button.node);
    }
}
//# sourceMappingURL=PanelHeader.js.map