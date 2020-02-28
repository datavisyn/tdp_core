import {PanelTab, IPanelTabDesc} from './PanelTab';
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

/**
 * HTML button with a custom title, CSS class, an onClick function
 * Acts as tab header/button and highlights itself when clicked depending on if the tab body is open or closed
 */
export class PanelNavButton implements IPanelButton {
  readonly node: HTMLElement;
  readonly order: number;

  /**
   * Constructor of the PanelButton
   * @param parent The parent HTML DOM element
   * @param onClick Function that should be executed on button click
   * @param setParentWidth callback to pass set the width of the parent
   * @param options Options to customize the PanelNavButton
   * @param defaultNavTab Should this PanelNavButton be the default active navButton
   */
  constructor(parent: HTMLElement, onClick: () => void, options: IPanelTabDesc, defaultNavTab?: boolean) {
    this.node = parent.ownerDocument.createElement('li');
    this.node.className = defaultNavTab ? 'active' : ' ';
    this.node.insertAdjacentHTML('afterbegin', `<a role="tab"  class="fa ${options.cssClass} " title="${options.title}" data-toggle="tab">&nbsp;<span>${options.title || ''}</span></a>`);
    this.node.addEventListener('click', (evt) => {
      evt.preventDefault();
      onClick();
    });
  }

  /**
   * When you click the shortcut button in collapsed mode focus on the navButton
   */
  setActive() {
    const navButtons = Array.from(this.node.parentElement.children);
    for (const nav of navButtons) {
      nav.classList.remove('active');
    }
    this.node.classList.add('active');
  }
}
