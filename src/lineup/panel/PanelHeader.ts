import {IPanelButton} from './PanelButton';


export enum EPanelHeaderToolbar {
  NAV,
  START,
  CENTER,
  END
}

/**
 * The panel header contains a list of panel buttons.
 */
export class PanelHeader {

  node: HTMLElement;
  private navToolbar: HTMLElement;
  private startToolbar: HTMLElement;
  private centerToolbar: HTMLElement;
  private endToolbar: HTMLElement;
  private buttons: IPanelButton[] = [];

  /**
   *
   * @param parent The parent HTML DOM element.
   * @param isTopMode Is the SidePanel collapsed or not.
   */
  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    this.node.classList.add('panel-header');
    parent.appendChild(this.node);
  }


  private createToolbar(cssClass: string = '') {
    const n = this.node.ownerDocument.createElement('div');
    n.className = `panel-toolbar ${cssClass}`;
    return n;
  }
  /**
   * Add a panel button to this header
   * @param button Panel button instance to add
   */
  addButton(button: IPanelButton, position: EPanelHeaderToolbar) {
    const buttonTag = 'BUTTON';
    const buttonElement = (button.node.tagName.toString() === buttonTag) ? button.node : button.node.firstElementChild;
    const camelizedTitle = buttonElement.getAttribute('title').replace(/\s/g, '');
    buttonElement.setAttribute(`data-testid`, `panel-header-${camelizedTitle}-button`);
    this.buttons = [...this.buttons, button];
    switch (position) {
      case EPanelHeaderToolbar.NAV:
        if (!this.navToolbar) {
          this.navToolbar = this.createToolbar();
          this.node.append(this.navToolbar);
        }

        this.navToolbar.append(button.node);
        break;
      case EPanelHeaderToolbar.START:
        if (!this.startToolbar) {
          this.startToolbar = this.createToolbar();
          this.node.append(this.startToolbar);
        }
        this.startToolbar.append(button.node);
        break;
      case EPanelHeaderToolbar.CENTER:
        if (!this.centerToolbar) {
          this.centerToolbar = this.createToolbar();
          this.node.append(this.centerToolbar);
        }
        this.centerToolbar.append(button.node);
        break;
      case EPanelHeaderToolbar.END:
        if (!this.endToolbar) {
          this.endToolbar = this.createToolbar('shortcut-toolbar');
          this.node.append(this.endToolbar);
        }
        this.endToolbar.append(button.node);
    }
  }
}
