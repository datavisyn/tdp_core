import { PanelTab } from './PanelTab';
export interface ITabContainer {
    /**
     * HTMLElement of the tab container
     */
    readonly node: HTMLElement;
    /**
     * Resize the Panel to fit the content of the new tab.
     * @param width width the PanelTabContainer should have.
     */
    resizeNode(width: string): void;
    /**
     * Method to add a new PanelTab.
     * @param tab New PanelTab instance.
     * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!.
     */
    addTab(tab: PanelTab, onClick?: () => void): void;
    /**
     * Close currentTab and show new PanelTab.
     * @param tab A PanelTab instance.
     */
    showTab(tab: PanelTab): void;
    /**
     * Show last opened PanelTab.
     * Used when the LineUpPanelActions reopens to show the last open PanelTab.
     */
    showCurrentTab(): void;
    /**
     * Hide currentTab.
     */
    hideCurrentTab(): void;
}
/**
 * The NullTabContainer does not have any functionality.
 * The public functions have no operation and the public properties are dummy HTMLElements.
 */
export declare class NullTabContainer implements ITabContainer {
    readonly node: HTMLElement;
    /**
     * Resize the Panel to fit the content of the new tab.
     * @param width width the PanelTabContainer should have.
     */
    resizeNode(width: string): void;
    /**
     * Method to add a new PanelTab.
     * @param tab New PanelTab instance.
     * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!.
     */
    addTab(tab: PanelTab, onClick?: () => void): void;
    /**
     * Close currentTab and show new PanelTab.
     * @param tab A PanelTab instance.
     */
    showTab(tab: PanelTab): void;
    /**
     * Show last opened PanelTab.
     * Used when the LineUpPanelActions reopens to show the last open PanelTab.
     */
    showCurrentTab(): void;
    /**
     * Hide currentTab.
     */
    hideCurrentTab(): void;
}
/**
 * The PanelTabContainer creates tab able nav buttons that toggle their corresponding PanelTab.
 */
export declare class PanelTabContainer implements ITabContainer {
    readonly node: HTMLElement;
    private readonly tabContentNode;
    private parent;
    private tabs;
    private tabHeader;
    private currentTab;
    /**
     * @param parent The parent HTML DOM element.
     */
    constructor(parent: HTMLElement);
    /**
     * Resize the Panel to fit the content of the new tab.
     * @param width width the PanelTabContainer should have.
     */
    resizeNode(width: string): void;
    /**
     * Method to add a new PanelTab.
     * @param tab New PanelTab instance.
     * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!.
     */
    addTab(tab: PanelTab, onClick?: () => void): void;
    /**
     * Close currentTab and show new PanelTab.
     * @param tab A PanelTab instance.
     */
    showTab(tab: PanelTab): void;
    /**
     * Show last opened PanelTab.
     * Used when the LineUpPanelActions reopens to show the last open PanelTab.
     */
    showCurrentTab(): void;
    /**
     * Hide currentTab.
     */
    hideCurrentTab(): void;
}
//# sourceMappingURL=PanelTabContainer.d.ts.map