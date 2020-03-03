import {IPanelButton} from './PanelButton';

/**
 * The panel header contains a list of panel buttons.
 */
export default class PanelHeader {

  readonly node: HTMLElement;
  private buttons: IPanelButton[] = [];

  /**
   *
   * @param parent The parent HTML DOM element.
   * @param isTopMode Is the SidePanel collapsed or not.
   */
  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    parent.appendChild(this.node);
  }

  /**
   * Add a panel button to this header
   * @param button Panel button instance to add
   */
  addButton(button: IPanelButton) {
    this.buttons = [...this.buttons, button];
    this.node.appendChild(button.node);
  }
}
