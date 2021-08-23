import {IPanelButton} from './PanelButton';


export enum EPanelHeaderToolbar {
  NAV,
  TOP,
  CENTER,
  BOTTOM
}

/**
 * The panel header contains a list of panel buttons.
 */
export class PanelHeader {

  readonly node: HTMLElement;
  private readonly navToolbar: HTMLElement;
  private readonly topToolbar: HTMLElement;
  private readonly centerToolbar: HTMLElement;
  private readonly bottomToolbar: HTMLElement;
  private buttons: IPanelButton[] = [];

  /**
   *
   * @param parent The parent HTML DOM element.
   * @param isTopMode Is the SidePanel collapsed or not.
   */
  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    this.node.classList.add('panel-header');
    this.navToolbar = this.createToolbar();
    this.topToolbar = this.createToolbar();
    this.centerToolbar = this.createToolbar();
    this.bottomToolbar = this.createToolbar();

    this.node.append(this.navToolbar);
    this.node.append(this.topToolbar);
    this.node.append(this.centerToolbar);
    this.node.append(this.bottomToolbar);

    parent.appendChild(this.node);
  }

  createToolbar() {
    const n = this.node.ownerDocument.createElement('div');
    n.classList.add('btn-group-custom', 'panel-toolbar');
    return n;
  }
  /**
   * Add a panel button to this header
   * @param button Panel button instance to add
   */
  addButton(button: IPanelButton, position: EPanelHeaderToolbar) {
    this.buttons = [...this.buttons, button];
    switch (position) {
      case EPanelHeaderToolbar.NAV:
        this.navToolbar.append(button.node);
        break;
      case EPanelHeaderToolbar.TOP:
        this.topToolbar.append(button.node);
        break;
      case EPanelHeaderToolbar.CENTER:
        this.centerToolbar.append(button.node);
        break;
      case EPanelHeaderToolbar.BOTTOM:
        this.bottomToolbar.append(button.node);
    }
  }
}
