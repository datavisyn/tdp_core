import {IPanelButton, PanelNavButton} from './PanelButton';

/**
 * The panel header contains a list of panel buttons.
 */
export default class PanelHeader {

  readonly node: HTMLElement;
  readonly buttonGroupNode: HTMLElement;
  readonly navGroupNode: HTMLElement;
  private buttons: IPanelButton[] = [];
  private navTabs: PanelNavButton[] = [];

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    parent.appendChild(this.node);
    this.buttonGroupNode = this.node.ownerDocument.createElement('div');
    this.navGroupNode = this.node.ownerDocument.createElement('ul');
    this.buttonGroupNode.classList.add('button-group');
    this.navGroupNode.className = 'nav nav-tabs';
    this.node.appendChild(this.buttonGroupNode);
    this.node.appendChild(this.navGroupNode);
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
   * Add a PanelNavTab to this header
   * @param button Panel button instance to add
   */
  addNav(nav: PanelNavButton) {
    this.navTabs = [...this.navTabs, nav];
    this.navGroupNode.appendChild(nav.node);
  }
}
