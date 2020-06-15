
import {SidePanel, spaceFillingRule, IGroupSearchItem, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, IEngineRankingContext, IRenderContext, IRankingHeaderContextContainer} from 'lineupjs';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {IPlugin, IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import {editDialog} from '../../storage';
import {
  IScoreLoader, EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON,
  IScoreLoaderExtensionDesc, IRankingButtonExtension, IRankingButtonExtensionDesc, EP_TDP_CORE_LINEUP_PANEL_TAB, IPanelTabExtensionDesc
} from '../../extensions';
import {EventHandler} from 'phovea_core/src/event';
import {IARankingViewOptions} from '../ARankingView';
import {lazyDialogModule} from '../../dialogs';
import PanelButton from './panel/PanelButton';
import {ITabContainer, PanelTabContainer, NullTabContainer} from './panel/PanelTabContainer';
import {PanelTab, SidePanelTab} from './panel/PanelTab';
import SearchBoxProvider from './panel/SearchBoxProvider';
import PanelHeader from './panel/PanelHeader';
import PanelRankingButton from './panel/PanelRankingButton';
import PanelAddColumnButton from './panel/PanelAddColumnButton';
import i18n from 'phovea_core/src/i18n';
import PanelDownloadButton from './panel/PanelDownloadButton';
import {IPanelTabExtension} from '../../extensions';

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

  private readonly searchBoxProvider: SearchBoxProvider;

  readonly panel: SidePanel | null;
  readonly node: HTMLElement; // wrapper node

  private readonly header: PanelHeader;
  private readonly tabContainer: ITabContainer;

  private overview: HTMLElement;
  private wasCollapsed = false;

  constructor(protected readonly provider: LocalDataProvider, ctx: IRankingHeaderContextContainer & IRenderContext & IEngineRankingContext, private readonly options: Readonly<IARankingViewOptions>, doc = document) {
    super();
    this.node = doc.createElement('aside');
    this.node.classList.add('lu-side-panel-wrapper');

    this.header = new PanelHeader(this.node);

    this.searchBoxProvider = new SearchBoxProvider();

    if (this.options.enableSidePanel === 'top') {
      this.node.classList.add('lu-side-panel-top');
      this.tabContainer = new NullTabContainer(); // tab container without functionality

    } else {
      const sidePanel = new SidePanelTab(this.node, this.searchBoxProvider.createSearchBox(), ctx, doc);
      this.panel = sidePanel.panel;
      this.tabContainer = new PanelTabContainer(this.node);
      this.tabContainer.addTab(sidePanel);
      this.tabContainer.showTab(sidePanel);
    }

    this.init();
    this.collapse = options.enableSidePanel === 'top' || options.enableSidePanel === 'collapsed';
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

    if(value) {
      this.tabContainer.hideCurrentTab(); // Hide the active PanelTab and inform its content to stop updating
    } else {
      this.tabContainer.showCurrentTab(); // Show the last active PanelTab and inform its content to start updating again
    }
  }

  hide() {
    this.node.style.display = 'none';

    // Hide the active PanelTab and inform its content to stop updating
    this.tabContainer.hideCurrentTab();
  }

  show() {
    this.node.style.display = 'flex';

    // Show the last active PanelTab and inform its content to start updating again
    this.tabContainer.showCurrentTab();
  }

  private get isTopMode() {
    return this.options.enableSidePanel === 'top';
  }

  get wasHidden() {
    return this.node.style.display === 'none';
  }

  private init() {
    const buttons = this.header.node;

    if (!this.isTopMode && this.options.enableSidePanelCollapsing) { // top mode doesn't need collapse feature
      const listener = () => {
        this.collapse = !this.collapse;
      };

      const collapseButton = new PanelButton(buttons, i18n.t('tdp:core.lineup.LineupPanelActions.collapseButton'), 'collapse-button', listener);
      this.header.addButton(collapseButton);
    }

    if (this.options.enableAddingColumns) {
      const addColumnButton = new PanelAddColumnButton(buttons, this.searchBoxProvider.createSearchBox());
      this.header.addButton(addColumnButton);
    }

    this.appendExtraButtons(buttons);

    if (this.options.enableSaveRanking) {
      const listener = (ranking: Ranking) => {
        editDialog(null, (name, description, sec) => {
          this.fire(LineUpPanelActions.EVENT_SAVE_NAMED_SET, ranking.getOrder(), name, description, sec);
        });
      };

      const saveRankingButton = new PanelRankingButton(buttons, this.provider, i18n.t('tdp:core.lineup.LineupPanelActions.saveEntities'), 'fa fa-save', listener);
      this.header.addButton(saveRankingButton);
    }

    if (this.options.enableDownload) {
      const downloadButtonContainer = new PanelDownloadButton(buttons, this.provider, this.isTopMode);
      this.header.addButton(downloadButtonContainer);
    }

    if (this.options.enableZoom) {
      const zoomInButton = new PanelButton(buttons, i18n.t('tdp:core.lineup.LineupPanelActions.zoomIn'), 'fa fa-search-plus gap', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN));
      this.header.addButton(zoomInButton);

      const zoomOutButton = new PanelButton(buttons, i18n.t('tdp:core.lineup.LineupPanelActions.zoomOut'), 'fa fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT));
      this.header.addButton(zoomOutButton);
    }

    if (this.options.enableOverviewMode) {
      const listener = () => {
        const selected = this.overview.classList.toggle('fa-th-list');
        this.overview.classList.toggle('fa-list');
        this.fire(LineUpPanelActions.EVENT_RULE_CHANGED, selected ? rule : null);
      };
      const overviewButton = new PanelButton(buttons, i18n.t('tdp:core.lineup.LineupPanelActions.toggleOverview'), this.options.enableOverviewMode === 'active' ? 'fa fa-th-list' : 'fa fa-list', listener);
      this.overview = overviewButton.node; // TODO might be removed
      this.header.addButton(overviewButton);
    }

    if (!this.isTopMode) {
      this.appendExtraTabs();
    }
  }

  setViolation(violation?: string) {
    if (violation) {
      this.overview.dataset.violation = violation;
    } else {
      delete this.overview.dataset.violation;
    }
  }

  private appendExtraButtons(parent: HTMLElement) {
    const buttons = <IRankingButtonExtensionDesc[]>listPlugins(EXTENSION_POINT_TDP_RANKING_BUTTON);
    return buttons.map((button) => {
      const listener = () => {
        button.load().then((p) => this.scoreColumnDialog(p));
      };

      const luButton = new PanelRankingButton(parent, this.provider, button.title, 'fa ' + button.cssClass, listener);
      this.header.addButton(luButton);
    });
  }

  private appendExtraTabs() {
    const plugins = <IPanelTabExtensionDesc[]>listPlugins(EP_TDP_CORE_LINEUP_PANEL_TAB).sort((a, b) => a.order - b.order);
    plugins.forEach((plugin) => {
      let isLoaded = false;
      const tab = new PanelTab(this.tabContainer.node, plugin);

      const onClick = () => {
        if (isLoaded) {
          if (this.collapse) {
            this.collapse = false; // expand side panel
          }
          this.tabContainer.showTab(tab);

        } else {
          plugin.load().then((p: IPanelTabExtension) => {
            p.factory(p.desc, tab, this.provider);
            this.collapse = false; // expand side panel
            this.tabContainer.showTab(tab);
            isLoaded = true;
          });
        }
      };

      if (plugin.shortcut) {
        this.header.addButton(tab.getShortcutButton());
      }

      this.tabContainer.addTab(tab, onClick);
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

    if (this.searchBoxProvider.length === 0) {
      return;
    }

    const {metaDataOptions, loadedScorePlugins} = await this.resolveScores(this.idType);

    const items: (ISearchOption | IGroupSearchItem<ISearchOption>)[] = [];

    if (this.options.enableAddingDatabaseColumns) {
      items.push(this.groupedDialog(i18n.t('tdp:core.lineup.LineupPanelActions.databaseColumns'), this.getColumnDescription(descs, false)));
    }

    if (this.options.enableAddingScoreColumns && loadedScorePlugins.length > 0) {
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

    if (this.options.enableAddingPreviousColumns) {
      const scoreDescs = this.getColumnDescription(descs, true);
      if (scoreDescs.length > 0) {
        items.push({
          text: i18n.t('tdp:core.lineup.LineupPanelActions.previouslyAddedColumns'),
          children: scoreDescs
        });
      }
    }

    const specialColumnsOption = {
      text: i18n.t('tdp:core.lineup.LineupPanelActions.specialColumns'),
      children: []
    };

    if (this.options.enableAddingCombiningColumns) {
      const combiningColumns = this.groupedDialog(i18n.t('tdp:core.lineup.LineupPanelActions.combiningColumns'), [
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum'), id: 'weightedSum', action: () => this.addColumn(createStackDesc(i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum')))},
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination'), id: 'scriptedCombination', action: () => this.addColumn(createScriptDesc(i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination')))},
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.nested'), id: 'nested', action: () => this.addColumn(createNestedDesc(i18n.t('tdp:core.lineup.LineupPanelActions.nested')))},
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.reduce'), id: 'reduce', action: () => this.addColumn(createReduceDesc())},
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.imposition'), id: 'imposition', action: () => this.addColumn(createImpositionDesc())}
      ]);
      specialColumnsOption.children.push(combiningColumns);
    }

    if (this.options.enableAddingSupportColumns) {
      const supportColumns = this.groupedDialog(i18n.t('tdp:core.lineup.LineupPanelActions.supportColumns'), [
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.groupInformation'), id: 'group', action: () => this.addColumn(createGroupDesc(i18n.t('tdp:core.lineup.LineupPanelActions.group')))},
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.selectionCheckbox'), id: 'selection', action: () => this.addColumn(createSelectionDesc())},
        {text: i18n.t('tdp:core.lineup.LineupPanelActions.aggregateGroup'), id: 'aggregate', action: () => this.addColumn(createAggregateDesc())}
      ]);
      specialColumnsOption.children.push(supportColumns);
    }

    if (this.options.enableAddingMetaDataColumns) {
      specialColumnsOption.children.push(...metaDataOptions);
    }

    // Only add special columns option if there are any items available
    if (specialColumnsOption.children.length > 0) {
      items.push(specialColumnsOption);
    }

    this.searchBoxProvider.update(items);
  }

  private groupedDialog(text: string, children: ISearchOption[]): ISearchOption | IGroupSearchItem<ISearchOption> {
    const viaDialog = this.options.enableAddingColumnGrouping;
    if (!viaDialog) {
      return {text, children};
    }
    return {
      text: i18n.t('tdp:core.lineup.LineupPanelActions.columnTitle', {text}),
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

export function findMappablePlugins(target: IDType, all: IPluginDesc[]) {
  if (!target) {
    return [];
  }
  const idTypes = Array.from(new Set<string>(all.map((d) => d.idtype)));

  function canBeMappedTo(idtype: string) {
    if (idtype === target.id) {
      return true;
    }
    // lookup the targets and check if our target is part of it
    return resolve(idtype).getCanBeMappedTo().then((mappables: IDType[]) => mappables.some((d) => d.id === target.id));
  }
  // check which idTypes can be mapped to the target one
  return Promise.all(idTypes.map(canBeMappedTo)).then((mappable: boolean[]) => {
    const valid = idTypes.filter((d, i) => mappable[i]);
    return all.filter((d) => valid.indexOf(d.idtype) >= 0);
  });
}
