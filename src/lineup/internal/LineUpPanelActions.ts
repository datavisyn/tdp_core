
import {SidePanel, spaceFillingRule, IGroupSearchItem, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, isSupportType, Column} from 'lineupjs';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {IPlugin, IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import {editDialog} from '../../storage';
import {
  IScoreLoader, EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON,
  IScoreLoaderExtensionDesc, IRankingButtonExtension, IRankingButtonExtensionDesc
} from '../../extensions';
import {EventHandler} from 'phovea_core/src/event';
import {IARankingViewOptions} from '../ARankingView';
import {exportLogic} from './export';
import {lazyDialogModule} from '../../dialogs';
import i18n from 'phovea_core/src/i18n';

export interface ISearchOption {
  text: string;
  id: string;
  action(): void;
}

export const rule = spaceFillingRule({
  groupHeight: 70,
  rowHeight: 18,
  groupPadding: 5
});

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

  private idType: IDType | null = null;

  private readonly search: SearchBox<ISearchOption> | null;

  readonly panel: SidePanel | null;
  readonly node: HTMLElement;
  private overview: HTMLElement;
  private wasCollapsed = false;

  constructor(protected readonly provider: LocalDataProvider, ctx: any, private readonly options: Readonly<IARankingViewOptions>, doc = document) {
    super();

    if (options.enableAddingColumns) {
      this.search = new SearchBox<ISearchOption>({
        placeholder: i18n.t('tdp:core.lineup.LineupPanelActions.searchPlaceholder')
      });
      this.search.on(SearchBox.EVENT_SELECT, (item) => {
        this.node.querySelector('.lu-adder')!.classList.remove('once');
        item.action();
      });
    }

    if (this.options.enableSidePanel !== 'top') {
      this.panel = new SidePanel(ctx, doc, {
        chooser: false
      });
      this.node = this.panel.node;
    } else {
      this.node = doc.createElement('div');
      this.node.classList.add('lu-side-panel', 'lu-side-panel-top');
    }
    this.node.classList.add('tdp-view-lineup');
    this.collapse = options.enableSidePanel === 'top' || options.enableSidePanel === 'collapsed';

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

    if (this.wasHidden) {
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

  private get isTopMode() {
    return this.options.enableSidePanel === 'top';
  }

  get wasHidden() {
    return this.node.style.display === 'none';
  }

  private init() {
    this.node.insertAdjacentHTML('afterbegin', `
      <section></section>
      <div class="lu-adder">${this.search ? `<button class="fa fa-plus" title="${i18n.t('tdp:core.lineup.LineupPanelActions.addColumnButton')}"></button>` : ''}
      </div>`);

    if (!this.isTopMode) { // top mode doesn't need collapse feature
      this.node.insertAdjacentHTML('afterbegin', `<a href="#" title="${i18n.t('tdp:core.lineup.LineupPanelActions.collapseButton')}"></a>`);
      this.node.querySelector('a')!.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        this.collapse = !this.collapse;
      });
    }

    const buttons = this.node.querySelector('section');
    this.appendExtraButtons().forEach((b) => buttons.appendChild(b));
    buttons.appendChild(this.appendSaveRanking());
    buttons.appendChild(this.appendDownload());
    if (this.options.enableZoom) {
      buttons.appendChild(this.createMarkup(i18n.t('tdp:core.lineup.LineupPanelActions.zoomIn'), 'fa fa-search-plus gap', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN)));
      buttons.appendChild(this.createMarkup(i18n.t('tdp:core.lineup.LineupPanelActions.zoomOut'), 'fa fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT)));
    }
    if (this.options.enableOverviewMode) {
      buttons.appendChild(this.appendOverviewButton());
    }

    const header = <HTMLElement>this.node.querySelector('.lu-adder')!;

    header.addEventListener('mouseleave', () => {
      header.classList.remove('once');
    });

    if (this.search) {
      header.appendChild(this.search.node);

      this.node.querySelector('.lu-adder button')!.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (!this.collapse) {
          return;
        }
        header.classList.add('once');
        (<HTMLElement>this.search.node.querySelector('input'))!.focus();
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
      this.fire(LineUpPanelActions.EVENT_RULE_CHANGED, selected ? rule : null);
    };
    return this.overview = this.createMarkup(i18n.t('tdp:core.lineup.LineupPanelActions.toggleOverview'), this.options.enableOverviewMode === 'active' ? 'fa fa-th-list' : 'fa fa-list', listener);
  }

  setViolation(violation?: string) {
    if (violation) {
      this.overview.dataset.violation = violation;
    } else {
      delete this.overview.dataset.violation;
    }
  }

  private appendDownload() {
    const node = this.node.ownerDocument.createElement('div');
    node.classList.add('btn-group', 'download-data-dropdown');
    node.innerHTML = `
      <button type="button" class="dropdown-toggle fa fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${i18n.t('tdp:core.lineup.LineupPanelActions.downloadData')}">
      </button>
      <ul class="dropdown-menu dropdown-menu-${this.isTopMode ? 'left' : 'right'}">
        <li class="dropdown-header">${i18n.t('tdp:core.lineup.LineupPanelActions.downloadAll')}</li>
        <li><a href="#" data-s="a" data-t="xlsx">${i18n.t('tdp:core.lineup.LineupPanelActions.excel')}</a></li>
        <li class="dropdown-header" data-num-selected-rows="0">${i18n.t('tdp:core.lineup.LineupPanelActions.downloadSelectedRows')}</li>
        <li><a href="#" data-s="s" data-t="xlsx">${i18n.t('tdp:core.lineup.LineupPanelActions.excel')}</a></li>
        <li role="separator" class="divider"></li>
        <li><a href="#" data-s="s" data-t="custom">${i18n.t('tdp:core.lineup.LineupPanelActions.customize')} &hellip;</a></li>
      </ul>
    `;

    // Listen for row selection and update number of selected rows
    // Show/hide some dropdown menu points accordingly using CSS
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + '.download-menu', (indices: number[]) => {
      (<HTMLElement>node.querySelector('[data-num-selected-rows]')).dataset.numSelectedRows = indices.length.toString();
    });

    const links = Array.from(node.querySelectorAll('a'));
    for (const link of links) {
      link.onclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const type = link.dataset.t;
        const onlySelected = link.dataset.s === 's';
        exportLogic(<any>type, onlySelected, this.provider).then(({content, mimeType, name}) => {
          this.downloadFile(content, mimeType, name);
        });
      };
    }


    return node;
  }

  private appendSaveRanking() {
    const listener = (ranking: Ranking) => {
      this.saveRankingDialog(ranking.getOrder());
    };

    return this.createMarkup(i18n.t('tdp:core.lineup.LineupPanelActions.saveEntities'), 'fa fa-save', listener);
  }

  private appendExtraButtons() {
    const buttons = <IRankingButtonExtensionDesc[]>listPlugins(EXTENSION_POINT_TDP_RANKING_BUTTON);
    return buttons.map((button) => {
      const listener = () => {
        button.load().then((p) => this.scoreColumnDialog(p));
      };
      return this.createMarkup(button.title, 'fa ' + button.cssClass, listener);
    });
  }

  private downloadFile(content: BufferSource | Blob | string, mimeType: string, name: string) {
    const doc = this.node.ownerDocument;
    const downloadLink = doc.createElement('a');
    const blob = new Blob([content], {type: mimeType});
    downloadLink.href = URL.createObjectURL(blob);
    (<any>downloadLink).download = name;

    doc.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  protected saveRankingDialog(order: number[]) {
    editDialog(null, (name, description, sec) => {
      this.fire(LineUpPanelActions.EVENT_SAVE_NAMED_SET, order, name, description, sec);
    });
  }

  private resolveArgs() {
    return typeof this.options.additionalScoreParameter === 'function' ? this.options.additionalScoreParameter() : this.options.additionalScoreParameter;
  }

  private getColumnDescription(descs: IColumnDesc[], addScores: boolean) {
    return descs
      .filter((d) => Boolean((<any>d)._score) === addScores)
      .map((d) => ({text: d.label, id: (<any>d).column, action: () => this.addColumn(d)}))
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

    const metaDataPluginPromises: Promise<IGroupSearchItem<any>>[] = metaDataPluginDescs
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

    const items: (ISearchOption | IGroupSearchItem<ISearchOption>)[] = [
      this.groupedDialog(i18n.t('tdp:core.lineup.LineupPanelActions.databaseColumns'), this.getColumnDescription(descs, false))
    ];

    if (loadedScorePlugins.length > 0) {
      items.push({
        text: i18n.t('tdp:core.lineup.LineupPanelActions.parameterizedScores'),
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
      });
    }

    const scoreDescs = this.getColumnDescription(descs, true);
    if (scoreDescs.length > 0) {
      items.push({
        text: i18n.t('tdp:core.lineup.LineupPanelActions.previouslyAddedColumns'),
        children: scoreDescs
      });
    }

    const combiningColumns = this.groupedDialog(i18n.t('tdp:core.lineup.LineupPanelActions.combiningColumns'), [
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum'), id: 'weightedSum', action: () => this.addColumn(createStackDesc(i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum')))},
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination'), id: 'scriptedCombination', action: () => this.addColumn(createScriptDesc(i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination')))},
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.nested'), id: 'nested', action: () => this.addColumn(createNestedDesc(i18n.t('tdp:core.lineup.LineupPanelActions.nested')))},
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.reduce'), id: 'reduce', action: () => this.addColumn(createReduceDesc())},
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.imposition'), id: 'imposition', action: () => this.addColumn(createImpositionDesc())}
    ]);

    const supportColumns = this.groupedDialog(i18n.t('tdp:core.lineup.LineupPanelActions.supportColumns'), [
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.groupInformation'), id: 'group', action: () => this.addColumn(createGroupDesc(i18n.t('tdp:core.lineup.LineupPanelActions.group')))},
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.selectionCheckbox'), id: 'selection', action: () => this.addColumn(createSelectionDesc())},
      {text: i18n.t('tdp:core.lineup.LineupPanelActions.aggregateGroup'), id: 'aggregate', action: () => this.addColumn(createAggregateDesc())}
    ]);

    items.push({
      text: i18n.t('tdp:core.lineup.LineupPanelActions.specialColumns'),
      children: [
        combiningColumns,
        supportColumns,
        ...metaDataOptions
      ]
    });

    this.search.data = items;
  }

  private groupedDialog(text: string, children: ISearchOption[]): ISearchOption | IGroupSearchItem<ISearchOption> {
    const viaDialog = this.options.enableAddingColumnGrouping;
    if (!viaDialog) {
      return {text, children};
    }
    return {
      text: text,
      id: `group_${text}`,
      action: () => {
        // choooser dialog
        lazyDialogModule().then((dialogs) => {
          const dialog = new dialogs.FormDialog(i18n.t('tdp:core.lineup.LineupPanelActions.addText', {text}), i18n.t('tdp:core.lineup.LineupPanelActions.addColumnButton'));
          dialog.form.insertAdjacentHTML('beforeend', `
            <select name="column" class="form-control">
              ${children.map((d) => `<option value="${d.id}">${d.text}</option>`).join('')}
            </select>
          `);
          dialog.onSubmit(() => {
            const data = dialog.getFormData();
            const selectedId = data.get('column');
            const child = children.find((d) => d.id === selectedId);
            if (child) {
              child.action();
            }
            return false;
          });
          dialog.hideOnSubmit();
          dialog.show();
        });
      }
    };
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
        if (Array.isArray(params)) {
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
