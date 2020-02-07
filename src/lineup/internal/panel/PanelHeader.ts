import {IPanelButton} from './PanelButton';

/**
 * The panel header contains a list of panel buttons.
 */
export default class PanelHeader {

  readonly node: HTMLElement;

  private buttons: IPanelButton[] = [];

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

  removeHighlighting() {
    const highlightedButton = this.buttons.find((button) => button.node.classList.contains('active'));
    if (highlightedButton) {
      highlightedButton.node.classList.remove('active');
    }
  }
}
