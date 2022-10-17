import { IPanelTabDesc } from './IPanelTabDesc';
/**
 * Interface for the LineUp panel button
 */
export interface IPanelButton {
  /**
   * DOM node of the LineUp panel button
   */
  readonly node: HTMLElement;
}

export interface IPanelButtonOptions {
  title?: string;
  faIcon: string;
  cssClass?: string;
  onClick: () => void;
  /**
   * add a custom button class
   * @example: btn-primary, btn-text-warning
   * @default: btn-text-dark
   */
  btnClass?: string;
}

/**
 * Plain HTML button with a custom title, CSS class and an onClick function
 */
export class PanelButton implements IPanelButton {
  readonly node: HTMLElement;

  /**
   * Constructor of the PanelButton
   * @param parent The parent HTML DOM element
   * @param options Options to configure button
   */
  constructor(parent: HTMLElement, options: IPanelButtonOptions) {
    this.node = parent.ownerDocument.createElement('button');
    this.node.setAttribute('type', 'button');
    if (options.title) {
      this.node.setAttribute('data-testid', `${options.title.replace(/\s+/g, '-').toLowerCase()}-button`);
      this.node.title = options.title;
    }
    this.node.className = `btn btn-sm ${options.btnClass || 'btn-text-dark'} ${options.cssClass || ''}`;
    this.node.innerHTML = `<i class="${options.faIcon} fa-fw"></i>`;

    this.node.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      options.onClick();
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
   * @param options Options to customize the PanelNavButton
   */
  constructor(parent: HTMLElement, onClick: () => void, options: IPanelTabDesc) {
    this.node = parent.ownerDocument.createElement('li');
    this.node.className = `nav-item ${options.cssClass || ''}`;
    this.order = options.order;
    this.node.innerHTML = `<a class="nav-link" role="tab" title="${options.title}" data-bs-toggle="tab"><i class="${options.faIcon}"> </i>&nbsp;<span>${
      options.title || ''
    }</span></a>`;
    this.node.querySelector('a').addEventListener('click', (evt) => {
      evt.preventDefault();
      onClick();
    });
  }

  /**
   * Set the active class to this button
   * @param isActive Toggle the class
   */
  setActive(isActive: boolean) {
    this.node.querySelector('a').classList.toggle('active', isActive);
  }

  /**
   * Trigger click event on anchor element.
   */
  click() {
    this.node.querySelector('a').click();
  }
}
