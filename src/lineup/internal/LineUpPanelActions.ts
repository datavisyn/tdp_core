
import SidePanel from 'lineupjs/src/ui/panel/SidePanel';
import {IRankingHeaderContext} from 'lineupjs/src/ui/engine/interfaces';
import {regular, spacefilling} from 'lineupjs/src/ui/taggle/LineUpRuleSet';
import {createStackDesc, IColumnDesc, createScriptDesc, Ranking, createImpositionDesc, createMinDesc, createMaxDesc, createMeanDesc, createNestedDesc} from 'lineupjs/src/model';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {IPlugin, IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import {editDialog} from '../../storage';
import {
  IScoreLoader, EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON,
  IScoreLoaderExtensionDesc, IRankingButtonExtension, IRankingButtonExtensionDesc
} from '../../extensions';
import ADataProvider from 'lineupjs/src/provider/ADataProvider';
import {exportRanking} from 'lineupjs/src/provider/utils';
import SearchBox from 'lineupjs/src/ui/panel/SearchBox';
import {EventHandler} from 'phovea_core/src/event';
import {IARankingViewOptions} from '../ARankingView';

export interface ISearchOption {
  text: string;
  id: string;
  action(): void;
}

/**
 * Wraps the score such that the plugin is loaded and the score modal opened, when the factory function is called
 * @param score
 * @returns {IScoreLoader}
 */
export function wrap(score: IPluginDesc): IScoreLoader {
  return {
    text: score.name,
    id: score.id,
    scoreId: score.id,
    factory(extraArgs: object, count: number) {
      return score.load().then((p) => Promise.resolve(p.factory(score, extraArgs, count)));
    }
  };
}

export default class LineUpPanelActions extends EventHandler {
  static readonly EVENT_ZOOM_OUT = 'zoomOut';
  static readonly EVENT_ZOOM_IN = 'zoomIn';
  static readonly EVENT_RULE_CHANGED = 'ruleChanged';
  static readonly EVENT_SAVE_NAMED_SET = 'saveNamedSet';
  /**
   * @deprecated
   */
  static readonly EVENT_ADD_SCORE_COLUMN = 'addScoreColumn';
  /**
   * (scoreName: string, scoreId: string, params: object) => void
   * @type {string}
   */
  static readonly EVENT_ADD_TRACKED_SCORE_COLUMN = 'addTrackedScoreColumn';

  private idType: IDType|null = null;

  private readonly search: SearchBox<ISearchOption>|null;

  readonly panel: SidePanel;
  private overview: HTMLElement;
  private wasCollapsed = false;

  constructor(protected readonly provider: ADataProvider, ctx: IRankingHeaderContext, private readonly options: Readonly<IARankingViewOptions>, doc = document) {
    super();

    if (options.enableAddingColumns) {
      this.search = new SearchBox<ISearchOption>({
        placeholder: 'Add Column...'
      });
      this.search.on(SearchBox.EVENT_SELECT, (item) => {
        this.node.querySelector('header')!.classList.remove('once');
        item.action();
      });
    }

    this.panel = new SidePanel(ctx, doc, {
      chooser: false
    });

    if (options.enableSidePanel === 'collapsed') {
      this.collapse = true;
    }

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

    if(this.wasHidden) {
      this.show();
    }
  }

  get collapse() {
    return this.node.classList.contains('collapsed');
  }

  set collapse(value: boolean) {
    this.node.classList.toggle('collapsed', value);
  }

  hide() {
    this.node.style.display = 'none';
  }

  show() {
    this.node.style.display = 'flex';
  }

  get wasHidden() {
    return this.node.style.display === 'none';
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
    if (this.options.enableZoom) {
      buttons.appendChild(this.createMarkup('Zoom In', 'fa fa-search-plus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN)));
      buttons.appendChild(this.createMarkup('Zoom Out', 'fa fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT)));
    }
    buttons.appendChild(this.appendDownload());
    buttons.appendChild(this.appendSaveRanking());
    if (this.options.enableOverviewMode) {
      buttons.appendChild(this.appendOverviewButton());
    }
    this.appendExtraButtons().forEach((b) => buttons.appendChild(b));

    const header = <HTMLElement>this.node.querySelector('header')!;

    header.addEventListener('mouseleave', () => {
      header.classList.remove('once');
    });

    if (this.search) {
      header.appendChild(this.search.node);

      this.node.querySelector('header button')!.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.collapse) {
          return;
        }
        header.classList.add('once');
        this.search.node.focus();
        this.search.focus();
      });
    }
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

  private appendOverviewButton() {
    const listener = () => {
      const selected = this.overview.classList.toggle('fa-th-list');
      this.overview.classList.toggle('fa-list');
      this.fire(LineUpPanelActions.EVENT_RULE_CHANGED, selected ? spacefilling : regular);
    };
    return this.overview =  this.createMarkup('En/Disable Overview', this.options.enableOverviewMode === 'active' ? 'fa fa-th-list': 'fa fa-list', listener);
  }

  setViolation(violation?: string) {
    if (violation) {
      this.overview.dataset.violation = violation;
    } else {
      delete this.overview.dataset.violation;
    }
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

  protected exportRanking(ranking: Ranking, provider: ADataProvider) {
    Promise.resolve(provider.view(ranking.getOrder())).then((data) => this.exportRankingImpl(ranking, data));
  }

  protected exportRankingImpl(ranking: Ranking, data: any[]) {
    const content = exportRanking(ranking, data, {separator: ';', quote: true, verboseColumnHeaders: true});
    const downloadLink = document.createElement('a');
    const blob = new Blob([content], {type: 'text/csv;charset=utf-8'});
    downloadLink.href = URL.createObjectURL(blob);
    (<any>downloadLink).download = 'export.csv';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  protected saveRankingDialog(order: number[]) {
    editDialog(null, (name, description, isPublic) => {
      this.fire(LineUpPanelActions.EVENT_SAVE_NAMED_SET, order, name, description, isPublic);
    });
  }

  private resolveArgs() {
    return typeof this.options.additionalScoreParameter === 'function' ? this.options.additionalScoreParameter() : this.options.additionalScoreParameter;
  }

  private getColumnDescription(descs: IColumnDesc[], addScores: boolean) {
    return descs
      .filter((d) => Boolean((<any>d)._score) === addScores)
      .map((d) => ({ text: d.label, id: (<any>d).column, action: () => this.addColumn(d)}))
      .sort((a, b) => a.text.localeCompare(b.text));
  }

  private addColumn(desc: IColumnDesc) {
    const ranking = this.provider.getLastRanking();
    ranking.push(this.provider.create(desc));
  }

  private async resolveScores(idType: IDType) {
    // load plugins, which need to be checked if the IDTypes are mappable
    const ordinoScores: IPluginDesc[] = await findMappablePlugins(idType, listPlugins(EXTENSION_POINT_TDP_SCORE));
    const metaDataPluginDescs = <IScoreLoaderExtensionDesc[]>await findMappablePlugins(idType, listPlugins(EXTENSION_POINT_TDP_SCORE_LOADER));

    const metaDataPluginPromises: Promise<ISearchOption>[] = metaDataPluginDescs
      .map((plugin: IScoreLoaderExtensionDesc) => plugin.load()
        .then((loadedPlugin: IPlugin) => loadedPlugin.factory(plugin))
        .then((scores: IScoreLoader[]) => {
          return this.buildMetaDataDescriptions(plugin, scores.sort((a, b) => a.text.localeCompare(b.text)));
        })
      );

    // Load meta data plugins
    const metaDataOptions = await Promise.all(metaDataPluginPromises);
    const loadedScorePlugins = ordinoScores.map((desc) => wrap(desc));
    return {metaDataOptions, loadedScorePlugins};
  }

  async updateChooser(idType: IDType, descs: IColumnDesc[]) {
    this.idType = idType;

    if (!this.search) {
      return;
    }
    const {metaDataOptions, loadedScorePlugins} = await this.resolveScores(this.idType);

    this.search.data = [
      {
        text: 'Database Columns',
        children: this.getColumnDescription(descs, false)
      },
      {
        text: 'Computed Scores',
        children: this.getColumnDescription(descs, true)
      },
      {
        text: 'Parameterized Scores',
        children: loadedScorePlugins.map((score) => {
          return {
            text: score.text,
            id: score.id,
            action: () => {
              // number of rows of the last ranking
              const amountOfRows = this.provider.getLastRanking().getOrder().length;

              // the factory function call executes the score's implementation
              score.factory(this.resolveArgs(), amountOfRows).then((params) => this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, score.text, score.id, params));
            }
          };
        })
      },
      {
        text: 'Combining Columns',
        children: [
          { text: 'Weighted Sum', id: 'weightedSum', action: () => this.addColumn(createStackDesc('Weighted Sum')) },
          { text: 'Scripted Combination', id: 'scriptedCombination', action: () => this.addColumn(createScriptDesc('Scripted Combination')) },
          { text: 'Nested', id: 'nested', action: () => this.addColumn(createNestedDesc('Nested')) },
          { text: 'Max Combination', id: 'max', action: () => this.addColumn(createMaxDesc()) },
          { text: 'Min Combination', id: 'min', action: () => this.addColumn(createMinDesc()) },
          { text: 'Mean Combination', id: 'mean', action: () => this.addColumn(createMeanDesc()) },
          { text: 'Imposition', id: 'imposition', action: () => this.addColumn(createImpositionDesc()) }
        ]
      },
      ...metaDataOptions
    ];
  }

  private buildMetaDataDescriptions(desc: IScoreLoaderExtensionDesc, columns: IScoreLoader[]) {
    return {
      text: desc.name,
      children: columns.map((plugin) => {
        return {
          text: plugin.text,
          id: plugin.text,
          action: () => {
            // number of rows of the last ranking
            const amountOfRows: number = this.provider.getLastRanking().getOrder().length;

            const params = plugin.factory(this.resolveArgs(), amountOfRows);
            this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, plugin.scoreId, params);
          }
        };
      })
    };
  }

  private scoreColumnDialog(scorePlugin: IRankingButtonExtension) {
    // pass dataSource into InvertedAggregatedScore factory method
    Promise.resolve(scorePlugin.factory(scorePlugin.desc, this.idType!, this.resolveArgs())) // open modal dialog
      .then((params) => { // modal dialog is closed and score created
        if(Array.isArray(params)) {
          params.forEach((param) => this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, scorePlugin.desc.name, scorePlugin.desc.id, param));
        } else {
          this.fire(LineUpPanelActions.EVENT_ADD_TRACKED_SCORE_COLUMN, scorePlugin.desc.id, params);
        }
      });
  }
}

function findMappablePlugins(target: IDType, all: IPluginDesc[]) {
  if (!target) {
    return [];
  }
  const idTypes = Array.from(new Set<string>(all.map((d) => d.idtype)));

  function canBeMappedTo(idtype: string) {
    if (idtype === target.id) {
      return true;
    }
    //lookup the targets and check if our target is part of it
    return resolve(idtype).getCanBeMappedTo().then((mappables: IDType[]) => mappables.some((d) => d.id === target.id));
  }
  //check which idTypes can be mapped to the target one
  return Promise.all(idTypes.map(canBeMappedTo)).then((mappable: boolean[]) => {
    const valid = idTypes.filter((d, i) => mappable[i]);
    return all.filter((d) => valid.indexOf(d.idtype) >= 0);
  });
}
