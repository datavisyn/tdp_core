import {IPanelButton} from './PanelButton';

export default class PanelHeader {

  readonly node: HTMLElement;

  private buttons: IPanelButton[] = [];

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    parent.appendChild(this.node);
  }

  addButton(button: IPanelButton) {
    this.buttons = [...this.buttons, button];
    this.node.appendChild(button.node);
  }
}
