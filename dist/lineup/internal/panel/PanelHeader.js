export var EPanelHeaderToolbar;
(function (EPanelHeaderToolbar) {
    EPanelHeaderToolbar[EPanelHeaderToolbar["NAV"] = 0] = "NAV";
    EPanelHeaderToolbar[EPanelHeaderToolbar["TOP"] = 1] = "TOP";
    EPanelHeaderToolbar[EPanelHeaderToolbar["CENTER"] = 2] = "CENTER";
    EPanelHeaderToolbar[EPanelHeaderToolbar["BOTTOM"] = 3] = "BOTTOM";
})(EPanelHeaderToolbar || (EPanelHeaderToolbar = {}));
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
        this.node.classList.add('panel-header');
        this.navToolbar = this.createToolbar();
        this.topToolbar = this.createToolbar();
        this.centerToolbar = this.createToolbar();
        this.bottomToolbar = this.createToolbar();
        this.node.append(this.navToolbar);
        this.node.append(this.topToolbar);
        this.node.append(this.centerToolbar);
        this.node.append(this.bottomToolbar);
        parent.appendChild(this.node);
    }
    createToolbar() {
        const n = this.node.ownerDocument.createElement('div');
        n.classList.add('btn-group-custom', 'panel-toolbar');
        return n;
    }
    /**
     * Add a panel button to this header
     * @param button Panel button instance to add
     */
    addButton(button, position) {
        this.buttons = [...this.buttons, button];
        switch (position) {
            case EPanelHeaderToolbar.NAV:
                this.navToolbar.append(button.node);
                break;
            case EPanelHeaderToolbar.TOP:
                this.topToolbar.append(button.node);
                break;
            case EPanelHeaderToolbar.CENTER:
                this.centerToolbar.append(button.node);
                break;
            case EPanelHeaderToolbar.BOTTOM:
                this.bottomToolbar.append(button.node);
        }
    }
}
//# sourceMappingURL=PanelHeader.js.map