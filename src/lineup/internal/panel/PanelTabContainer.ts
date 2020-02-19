import {PanelTab} from './PanelTab';

/**
 * The PanelTabContainer contains an array of PanelTabs
 * Exposes methods to toggle between PanelTabs
 */
export default class PanelTabContainer {

  readonly node: HTMLElement;

  private tabs: PanelTab[] = [];

  private currentTab: PanelTab;

  /**
   * @param parent The parent HTML DOM element
   */
  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('main');
    this.node.classList.add('tab-content');
    parent.appendChild(this.node);
  }

  /**
   * Find default/active tab
   * @returns A PanelTab instance
   */
  private get defaultTab(): PanelTab {
    return this.tabs.find((tab) => tab.isDefault());
  }

  /**
   * Method to add a new PanelTab
   * @param tab New PanelTab instance
   */
  public addTab(tab: PanelTab) {
    this.tabs = [...this.tabs, tab];
    this.node.appendChild(tab.node);
  }

  /**
   * Close currentTab and show new PanelTab
   * @param tab A PanelTab instance
   */
  public showTab(tab: PanelTab) {
    if (this.currentTab) {
      this.currentTab.hide();
    }

    tab.show();
    this.currentTab = tab;
  }
  /**
   * Show last opened PanelTab
   * Used when the LineUpPanelActions reopens to show the last open PanelTab
   */
  public showCurrentTab() {
    this.currentTab.show();
  }
  /**
   * Hide currentTab
   */
  public hideCurrentTab() {
    this.currentTab.hide();
  }
}
