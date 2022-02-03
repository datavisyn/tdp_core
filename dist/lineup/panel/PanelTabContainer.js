/**
 * The header of the PanelTab
 * Contains the PanelNavButtons that toggle the PanelTab
 */
class PanelTabHeader {
    /**
     * @param parent The parent HTML DOM element
     */
    constructor(parent) {
        this.node = parent.ownerDocument.createElement('ul');
        this.node.className = 'nav nav-tabs';
        parent.appendChild(this.node);
    }
    /**
     * Append PanelNavButtons to PanelTabHeader
     * @param button PanelNavButton instance to add
     */
    addNavButton(button) {
        this.node.appendChild(button.node);
    }
}
/**
 * The NullTabContainer does not have any functionality.
 * The public functions have no operation and the public properties are dummy HTMLElements.
 */
export class NullTabContainer {
    constructor() {
        this.node = null;
    }
    /**
     * Resize the Panel to fit the content of the new tab.
     * @param width width the PanelTabContainer should have.
     */
    resizeNode(width) {
        // noop
    }
    /**
     * Method to add a new PanelTab.
     * @param tab New PanelTab instance.
     * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!.
     */
    addTab(tab, onClick) {
        // noop
    }
    /**
     * Close currentTab and show new PanelTab.
     * @param tab A PanelTab instance.
     */
    showTab(tab) {
        // noop
    }
    /**
     * Show last opened PanelTab.
     * Used when the LineUpPanelActions reopens to show the last open PanelTab.
     */
    showCurrentTab() {
        // noop
    }
    /**
     * Hide currentTab.
     */
    hideCurrentTab() {
        // noop
    }
}
/**
 * The PanelTabContainer creates tab able nav buttons that toggle their corresponding PanelTab.
 */
export class PanelTabContainer {
    /**
     * @param parent The parent HTML DOM element.
     */
    constructor(parent) {
        this.tabs = [];
        this.parent = parent;
        this.node = parent.ownerDocument.createElement('main');
        this.tabContentNode = this.node.ownerDocument.createElement('div');
        this.tabContentNode.classList.add('tab-content');
        this.tabHeader = new PanelTabHeader(this.node);
        this.node.appendChild(this.tabContentNode);
        parent.appendChild(this.node);
    }
    /**
     * Resize the Panel to fit the content of the new tab.
     * @param width width the PanelTabContainer should have.
     */
    resizeNode(width) {
        this.parent.style.width = width;
    }
    /**
     * Method to add a new PanelTab.
     * @param tab New PanelTab instance.
     * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!.
     */
    addTab(tab, onClick) {
        this.tabs = [...this.tabs, tab];
        const listener = onClick ||
            (() => {
                this.showTab(tab);
            });
        this.tabHeader.addNavButton(tab.getNavButton(listener));
        this.tabContentNode.appendChild(tab.node);
    }
    /**
     * Close currentTab and show new PanelTab.
     * @param tab A PanelTab instance.
     */
    showTab(tab) {
        if (this.currentTab) {
            this.currentTab.hide();
        }
        this.resizeNode(tab.options.width);
        tab.show();
        this.currentTab = tab;
    }
    /**
     * Show last opened PanelTab.
     * Used when the LineUpPanelActions reopens to show the last open PanelTab.
     */
    showCurrentTab() {
        this.currentTab.show();
    }
    /**
     * Hide currentTab.
     */
    hideCurrentTab() {
        this.currentTab.hide();
    }
}
//# sourceMappingURL=PanelTabContainer.js.map