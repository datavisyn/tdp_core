
export interface ILineUpPanelButton {
  readonly node: HTMLElement;
}

export default class LineUpPanelButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, title: string, linkClass: string, onClick: () => void) {
    this.node = parent.ownerDocument.createElement('button');
    this.node.className = linkClass;
    this.node.title = title;
    this.node.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      onClick();
    });
  }
}
