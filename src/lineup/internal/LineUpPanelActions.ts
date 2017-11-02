
import {ALineUpActions} from './ALineUpActions';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';
import IDType from 'phovea_core/src/idtype/IDType';
import SidePanel from 'lineupjs/src/ui/panel/SidePanel';
import {IRankingHeaderContext} from 'lineupjs/src/ui/engine/interfaces';
import {list as listPlugins} from 'phovea_core/src/plugin';
import {IRankingButtonExtensionDesc, EXTENSION_POINT_TDP_RANKING_BUTTON} from '../../extensions';
import Ranking from 'lineupjs/src/model/Ranking';
import {regular, spacefilling} from 'lineupjs/src/ui/taggle/LineUpRuleSet';

export default class LineUpPanelActions extends ALineUpActions {
  static readonly EVENT_ZOOM_OUT = 'zoomOut';
  static readonly EVENT_ZOOM_IN = 'zoomIn';
  static readonly EVENT_RULE_CHANGED = 'ruleChanged';

  readonly panel: SidePanel;
  private spaceFilling: HTMLElement;
  private wasCollapsed = false;

  constructor(provider: ADataProvider, ctx: IRankingHeaderContext, idType: () => IDType, extraArgs: object|(() => object), doc = document) {
    super(provider, idType, extraArgs);

    this.panel = new SidePanel(ctx, doc, {
      chooser: false
    });

    this.init();
  }

  forceCollapse() {
    this.wasCollapsed = this.collapse;
    this.collapse = true;
  }

  releaseForce() {
    if (!this.wasCollapsed) {
      this.collapse = false;
    }
  }

  get collapse() {
    return this.node.classList.contains('collapsed');
  }

  set collapse(value: boolean) {
    this.node.classList.toggle('collapsed', value);
  }

  get node() {
    return this.panel.node;
  }

  private init() {
    this.node.insertAdjacentHTML('afterbegin', `
      <a href="#" title="(Un)Collapse"></a>
      <section></section>
      <header><button class="fa fa-plus"></button>
      </header>`);

    this.node.querySelector('a')!.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.collapse = !this.collapse;
    });

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Zoom In', 'fa fa-search-plus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN)));
    buttons.appendChild(this.createMarkup('Zoom Out', 'fa fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT)));
    buttons.appendChild(this.appendDownload());
    buttons.appendChild(this.appendSaveRanking());
    this.appendExtraButtons().forEach((b) => buttons.appendChild(b));

    const header = this.node.querySelector('header')!;

    const chooser = this.createChooser(header, null, () => header.classList.remove('once'));

    this.node.querySelector('header button')!.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (!this.collapse) {
        return;
      }
      header.classList.add('once');
      chooser.then((c) => c.focus());
    });

    {
      this.node.insertAdjacentHTML('beforend', `<div class="lu-rule-button-chooser">
            <div><span>Overview</span>
              <code></code>
            </div>
        </div>`);
      this.spaceFilling = <HTMLElement>this.node.querySelector('.lu-rule-button-chooser :first-child')!;
      this.spaceFilling.addEventListener('click', () => {
        const selected = this.spaceFilling.classList.toggle('chosen');
        this.fire(LineUpPanelActions.EVENT_RULE_CHANGED, selected ? spacefilling : regular);
      });
    }

  }

  setViolation(violation?: string) {
    violation = violation || '';
    this.spaceFilling.classList.toggle('violated', Boolean(violation));
    this.spaceFilling.lastElementChild!.textContent = violation.replace(/\n/g, '<br>');
  }

  private createMarkup(title: string, linkClass: string, onClick: (ranking: Ranking) => void) {
    const b = this.node.ownerDocument.createElement('button');
    b.className = linkClass;
    b.title = title;
    b.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      const first = this.provider.getRankings()[0];
      if (first) {
        onClick(first);
      }
    });
    return b;
  }

  private appendDownload() {
    const listener = (ranking: Ranking) => {
      this.exportRanking(ranking, <ADataProvider>this.provider);
    };
    return this.createMarkup('Export Data', 'fa fa-download', listener);
  }

  private appendSaveRanking() {
    const listener = (ranking: Ranking) => {
      this.saveRankingDialog(ranking.getOrder());
    };

    return this.createMarkup('Save Named Set', 'fa fa-save', listener);
  }

  private appendExtraButtons() {
    const buttons = <IRankingButtonExtensionDesc[]>listPlugins(EXTENSION_POINT_TDP_RANKING_BUTTON);
    return buttons.map((button) => {
      const listener = () => {
        button.load().then((p) => this.scoreColumnDialog(p));
      };
      return this.createMarkup(button.name,'fa ' + button.cssClass, listener);
    });
  }
}
