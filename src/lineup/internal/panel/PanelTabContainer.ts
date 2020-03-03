import {PanelTab} from './PanelTab';
import {PanelNavButton} from './PanelButton';



/**
 * The header of the PanelTab
 * Contains the PanelNavButtons that toggle the PanelTab
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
   * Append PanelNavButtons to PanelTabHeader
   * @param button PanelNavButton instance to add
   */
  addNavButton(button: PanelNavButton) {
    this.node.appendChild(button.node);
  }
}


/**
 * The PanelTabContainer creates tab able nav buttons that toggle their corresponding PanelTab.
 */
export default class PanelTabContainer {

  readonly node: HTMLElement;
  readonly tabContentNode: HTMLElement;
  private parent: HTMLElement;
  private tabs: PanelTab[] = [];
  private tabHeader: PanelTabHeader;
  private currentTab: PanelTab;


  /**
   * @param parent The parent HTML DOM element.
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
   * Resize the Panel to fit the content of the new tab.
   * @param width width the PanelTabContainer should have.
   */
  resizeNode(width: string) {
    this.parent.style.width = width;
  }

  /**
   * Method to add a new PanelTab.
   * @param tab New PanelTab instance.
   * @param onClick Optional function that is executed on the tab; Important: You must call `tabContainer.showTab()` yourself!.
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
   * Close currentTab and show new PanelTab.
   * @param tab A PanelTab instance.
   */
  public showTab(tab: PanelTab) {
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
  public showCurrentTab() {
    this.currentTab.show();
  }

  /**
   * Hide currentTab.
   */
  public hideCurrentTab() {
    this.currentTab.hide();
  }
}
