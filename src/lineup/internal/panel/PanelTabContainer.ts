import {PanelTab} from './PanelTab';
import {PanelNavButton} from './PanelButton';



/**
 * Acts as the navigation to the TabPanels
 * Allows the addition in the correct order of PanelNavButtons
 */
class PanelTabHeader {
  public node: HTMLElement;
  public navButtons: PanelNavButton[] = [];

  /**
   * @param parent The parent HTML DOM element
   */
  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('ul');
    this.node.className = 'nav nav-tabs';
    parent.appendChild(this.node);
  }

  /**
   *
   * @param navTabs NavTabs array sorted according to their order property
   * @param nav New nav being added to the NavTabs
   */
  getNextSibling(sortedNavTabs: PanelNavButton[], nav: PanelNavButton): PanelNavButton | null {
    const navTabsLength = sortedNavTabs.length;
    const navIndex = sortedNavTabs.findIndex((n) => n.order === nav.order);
    return navIndex === navTabsLength - 1 ? null : sortedNavTabs[navIndex + 1];
  }

  /**
   * Add nav-tab to the nav-tabs in the correct order.
   * @param button PanelNavButton instance to add
   */
  addNavButton(button: PanelNavButton) {
    const sameOrderNav = this.navButtons.find((n) => n.order === button.order); // find nav with same order
    this.navButtons = [...this.navButtons, button].sort((nav1, nav2) => nav1.order - nav2.order);
    this.node.appendChild(button.node);
    const nextSibling = sameOrderNav || this.getNextSibling(this.navButtons, button); // if same order property append new nav before it
    if (nextSibling) {
      this.node.insertBefore(button.node, nextSibling.node);
    } else {
      this.node.appendChild(button.node);
    }
  }
}


/**
 * The PanelTabContainer creates tab able nav buttons that toggle their corresponding PanelTab
 */
export default class PanelTabContainer {

  readonly node: HTMLElement;
  private parent: HTMLElement;
  readonly tabContentNode: HTMLElement;
  private tabs: PanelTab[] = [];
  private tabHeader: PanelTabHeader;
  private currentTab: PanelTab;


  /**
   * @param parent The parent HTML DOM element
   */
  constructor(parent: HTMLElement) {
    this.parent = parent;
    this.node = parent.ownerDocument.createElement('main');

    this.tabContentNode = this.node.ownerDocument.createElement('div');
    this.tabContentNode.classList.add('tab-content');

    this.tabHeader = new PanelTabHeader(this.node);

    this.node.appendChild(this.tabContentNode);
    parent.appendChild(this.node);
  }

  /**
   * Resize the Panel to fit the content of the new tab
   * @param width width the PanelTabContainer should have;
   */
  resizeNode(width: string) {
    this.parent.style.width = width;
  }

  /**
   * Method to add a new PanelTab
   * @param tab New PanelTab instance
   * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!
   */
  public addTab(tab: PanelTab, onClick?: () => void) {
    this.tabs = [...this.tabs, tab];

    const listener = (onClick) ? onClick : () => {
      this.showTab(tab);
    };

    this.tabHeader.addNavButton(tab.getNavButton(listener));
    this.tabContentNode.appendChild(tab.node);
  }

  /**
   * Close currentTab and show new PanelTab
   * @param tab A PanelTab instance
   */
  public showTab(tab: PanelTab) {
    if (this.currentTab) {
      this.currentTab.hide();
    }

    this.resizeNode(tab.width);
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
