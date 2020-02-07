/**
 * Interface for the LineUp panel button
 */
export interface IPanelButton {
  /**
   * DOM node of the LineUp panel button
   */
  readonly node: HTMLElement;
}

/**
 * Plain HTML button with a custom title, CSS class and an onClick function
 */
export default class PanelButton implements IPanelButton {
  readonly node: HTMLElement;

  /**
   * Constructor of the PanelButton
   * @param parent The parent HTML DOM element
   * @param title String that is used for the title attribute
   * @param linkClass CSS classes to apply
   * @param onClick Function that should be executed on button click
   */
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
