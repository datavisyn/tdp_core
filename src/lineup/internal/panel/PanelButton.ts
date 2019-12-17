
export interface IPanelButton {
  readonly node: HTMLElement;
}

export default class PanelButton implements IPanelButton {
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
export class PanelNavButton implements IPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private readonly tabNode: HTMLElement, title: string, linkClass: string, onClick: () => void) {
    this.node = parent.ownerDocument.createElement('button');
    this.node.className = linkClass;
    this.node.title = title;
    this.node.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      this.highlight();
      onClick();
    });
  }
  private highlight() {
    if (!this.tabNode.classList.contains('active')) {
      this.node.classList.add('active');

    } else {
      this.node.classList.remove('active');
    }

  }
}
