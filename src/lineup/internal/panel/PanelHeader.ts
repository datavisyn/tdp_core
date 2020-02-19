import {IPanelButton, PanelNavButton} from './PanelButton';

/**
 * The panel header contains a list of panel buttons.
 */
export default class PanelHeader {

  readonly node: HTMLElement;
  readonly buttonGroupNode: HTMLElement;
  readonly navTabsNode: HTMLElement;
  private buttons: IPanelButton[] = [];
  private navTabs: PanelNavButton[] = [];
  /**
   *
   * @param parent The parent HTML DOM element
   * @param isTopMode Is top mode
   */
  constructor(parent: HTMLElement, isTopMode: boolean) {
    this.node = parent.ownerDocument.createElement('header');
    parent.appendChild(this.node);
    this.buttonGroupNode = this.node.ownerDocument.createElement('div');
    this.buttonGroupNode.classList.add('button-group');
    this.node.appendChild(this.buttonGroupNode);
    //No nav-tabs when on top mode
    if (!isTopMode) {
      this.navTabsNode = this.node.ownerDocument.createElement('ul');
      this.navTabsNode.className = 'nav nav-tabs';
      this.node.appendChild(this.navTabsNode);
    }
  }

  /**
   * Add a panel button to this header
   * @param button Panel button instance to add
   */
  addButton(button: IPanelButton) {
    this.buttons = [...this.buttons, button];
    this.buttonGroupNode.appendChild(button.node);
  }

  /**
   * Ad nav-tab to the nav-tabs
   * @param button Panel button instance to add
   */
  addNav(nav: PanelNavButton) {
    this.navTabs = [...this.navTabs, nav];
    this.navTabsNode.appendChild(nav.node);
  }
}
