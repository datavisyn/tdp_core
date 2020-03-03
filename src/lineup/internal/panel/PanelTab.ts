import {SidePanel, SearchBox} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import {EventHandler} from 'phovea_core/src/event';
import PanelButton, {PanelNavButton} from './PanelButton';

/**
 * Interface for the options parameter of PanelTab
 */
export interface IPanelTabDesc {

  /**
   * Width of the SidePanel
   */
  width: string;

  /**
   * CSS class for PanelNavButton of the PanelTab
   */
  cssClass: string;

  /**
   * Title and Text content for the PanelNavButton of the PanelTab.
   */
  title: string;

  /**
   * Define the sort order of the PanelNavButtons
   */
  order: number;

  /**
   * Show PanelNavButton in collapsed mode
   * @default false
   */
  shortcut?: boolean;
}

/**
 * Events for PanelTab for when its showed/hidden
 */
export class PanelTabEvents extends EventHandler {

  static readonly SHOW_PANEL = 'showPanel';

  static readonly HIDE_PANEL = 'hidePanel';

}

/**
 * The PanelTab creates a tab component that with can be toggled through the PanelNavButton
 */
export class PanelTab {

  readonly node: HTMLElement;
  readonly events: PanelTabEvents;
  readonly width: string;

  private navButton: PanelNavButton;

  /**
   * @param parent The parent HTML DOM element
   * @param options Extra styles to apply to the PanelTab
   */
  constructor(parent: HTMLElement, private options: IPanelTabDesc) {
    this.events = new PanelTabEvents();
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tab-pane');
    this.node.setAttribute('role', 'tabpanel');
    const o = Object.assign({}, options);
    this.width = o.width;
  }

  /**
   * Show this tab and fire the `PanelTabEvents.SHOW_PANEL` event.
   */
  public show() {
    this.node.classList.add('active');
    this.navButton.setActive(true);
    this.events.fire(PanelTabEvents.SHOW_PANEL);
  }

  /**
   * Hide this tab and fire the `PanelTabEvents.HIDE_PANEL` event.
   */
  public hide() {
    this.node.classList.remove('active');
    this.navButton.setActive(false);
    this.events.fire(PanelTabEvents.HIDE_PANEL);
  }

  getNavButton(listener): PanelNavButton {
    // Note: `document.body` is used only for `parent.ownerDocument.createElement()` inside the button
    this.navButton = new PanelNavButton(document.body, listener, this.options);
    return this.navButton;
  }

  getShortcutButton(): PanelButton {
    const onClick = () => {
      this.navButton.click();
    };

    // Note: `document.body` is used only for `parent.ownerDocument.createElement()` inside the button
    return new PanelButton(document.body, this.options.title, 'fa ' + this.options.cssClass + ' shortcut-nav', onClick);
  }
}

/**
 * Default active PanelTab
 * Contains LineUp SidePanel and LineUp SearchBox
 */
export class SidePanelTab extends PanelTab {

  readonly panel: SidePanel | null;

  /**
   * @param parent The parent HTML DOM element
   * @param search LineUp SearchBox
   * @param ctx LineUp context
   * @param doc Document
   */
  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>, ctx: any, doc = document, options: IPanelTabDesc) {
    super(parent, options);
    this.node.classList.add('default');
    this.panel = new SidePanel(ctx, doc, {
      chooser: false
    });

    this.node.appendChild(this.search.node);
    this.node.appendChild(this.panel.node);
  }
}
