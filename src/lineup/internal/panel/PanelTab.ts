import {SidePanel, SearchBox} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';

interface IPanelTabOptions {
  tabWidth: string;
}

export class PanelTab {

  readonly node: HTMLElement;

  constructor(parent: HTMLElement, options?: Partial<IPanelTabOptions>) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tab-pane');

    const o = Object.assign({}, options);
    this.node.style.width = o.tabWidth || null;
  }

  show() {
    this.node.classList.add('active');
  }

  hide() {
    this.node.classList.remove('active');
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
