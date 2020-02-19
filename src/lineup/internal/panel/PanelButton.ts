import {PanelTab} from './PanelTab';
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

  /**
   * Constructor of the PanelButton
   * @param parent The parent HTML DOM element
   * @param tab The tab it is connected to
   * @param title String that is used for the title attribute
   * @param linkClass CSS classes to apply
   * @param onClick Function that should be executed on button click
   * @param defaultNavTab Should PanelNavButton be default active  nav-tab
   */
  constructor(parent: HTMLElement, title: string, linkClass: string, onClick: () => void, defaultNavTab?: boolean) {

    this.node = parent.ownerDocument.createElement('li');
    this.node.className = defaultNavTab ? 'active' : ' ';
    this.node.insertAdjacentHTML('afterbegin', `<a class= "${linkClass}" title="${title}" data-toggle="tab"></a>`);
    this.node.addEventListener('click', (evt) => {
      evt.preventDefault();
      onClick();
    });
  }
}
