import {SidePanel, SearchBox} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import {EventHandler} from 'phovea_core/src/event';

export interface IPanelTabDesc {
  width: string;
}

export class PanelTabEvents extends EventHandler {

  static readonly SHOW_PANEL = 'showPanel';

  static readonly HIDE_PANEL = 'hidePanel';

}

export class PanelTab {

  readonly node: HTMLElement;
  readonly events: PanelTabEvents;

  constructor(parent: HTMLElement, options?: IPanelTabDesc) {
    this.events = new PanelTabEvents();

    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tab-pane');

    const o = Object.assign({}, options);
    this.node.style.width = o.width + 'em' || null;
  }

  public show() {
    this.node.classList.add('active');
    this.events.fire(PanelTabEvents.SHOW_PANEL);
  }

  public hide() {
    this.node.classList.remove('active');
    this.events.fire(PanelTabEvents.HIDE_PANEL);
  }

  public isClosed() {
    return !this.node.classList.contains('active')
  }
}

export class SidePanelTab extends PanelTab {

  readonly panel: SidePanel | null;

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
