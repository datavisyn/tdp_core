import {ILineUpPanelButton} from './LineUpPanelButton';

export default class LineUpPanelHeader {

  readonly node: HTMLElement;

  private buttons: ILineUpPanelButton[] = [];

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    parent.appendChild(this.node);
  }

  addButton(button: ILineUpPanelButton) {
    this.buttons = [...this.buttons, button];
    this.node.appendChild(button.node);
  }
}
