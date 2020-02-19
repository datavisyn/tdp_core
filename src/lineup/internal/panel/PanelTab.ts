import {SidePanel, SearchBox} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import {EventHandler} from 'phovea_core/src/event';

/**
 * Interface for the options parameter of PanelTab
 */
export interface IPanelTabDesc {
  /**
   * Width of the PanelTab (unit is "em")
   */
  width: string;
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
 * Exposes `show()`, `hide()`, `isClosed()` methods
 */
export class PanelTab {

  readonly node: HTMLElement;
  readonly events: PanelTabEvents;
  /**
   *
   * @param parent The parent HTML DOM element
   * @param options Extra styles to apply to the PanelTab
   */
  constructor(parent: HTMLElement, options?: IPanelTabDesc) {
    this.events = new PanelTabEvents();

    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tab-pane');

    const o = Object.assign({}, options);
    this.node.style.width = o.width + 'em' || null;
  }
  /**
   * Show self/ add active class
   * Fire `SHOW_PANEL` event
   */
  public show() {
    this.node.classList.add('active');
    this.events.fire(PanelTabEvents.SHOW_PANEL);
  }

  /**
   * Hide self/ remove active class
   * Fire `HIDE_PANEL` event
   */
  public hide() {
    this.node.classList.remove('active');
    this.events.fire(PanelTabEvents.HIDE_PANEL);
  }
  /**
   * Is the tab active/open
   */
  public isClosed() {
    return !this.node.classList.contains('active');
  }
  /**
   * Is currentTab default active/ open tab
   */
  isDefault() {
    return !this.node.classList.contains('default');
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
   * @param ctx Ctx
   * @param doc Document
   */
  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>, ctx: any, doc = document) {
    super(parent);
    this.node.classList.add('default');
    this.panel = new SidePanel(ctx, doc, {
      chooser: false
    });

    this.node.appendChild(this.search.node);
    this.node.appendChild(this.panel.node);
  }
}
