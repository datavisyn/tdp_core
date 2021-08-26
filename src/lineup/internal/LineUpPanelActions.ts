
import {SidePanel, IGroupSearchItem, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, IEngineRankingContext, IRenderContext, IRankingHeaderContextContainer, UIntTypedArray} from 'lineupjs';
import {IDType} from 'phovea_core';
import {IPlugin, IPluginDesc, EventHandler, I18nextManager, PluginRegistry, IDTypeManager} from 'phovea_core';
import {StoreUtils} from '../../storage';
import {
  EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON,
  EP_TDP_CORE_LINEUP_PANEL_TAB
} from '../../base/extensions';
import {IARankingViewOptions} from '../IARankingViewOptions';
import {PanelButton} from './panel/PanelButton';
import {ITabContainer, PanelTabContainer, NullTabContainer} from './panel/PanelTabContainer';
import {PanelTab, SidePanelTab} from './panel/PanelTab';
import {SearchBoxProvider} from './panel/SearchBoxProvider';
import {PanelHeader} from './panel/PanelHeader';
import {PanelRankingButton} from './panel/PanelRankingButton';
import {PanelAddColumnButton} from './panel/PanelAddColumnButton';
import {PanelDownloadButton} from './panel/PanelDownloadButton';
import {IScoreLoader, IRankingButtonExtensionDesc, IScoreLoaderExtensionDesc, IRankingButtonExtension} from '../../base/interfaces';
import {ISearchOption} from './panel/ISearchOption';
import {LineupUtils} from '../utils';
import {IAdditionalColumnDesc, isAdditionalColumnDesc} from '../../base/interfaces';
import {FormElementType, IForm} from '../../form/interfaces';
import {FormDialog} from '../../form';
import {PanelSaveNamedSetButton} from './panel/PanelSaveNamedSetButton';
import {LineUpOrderedRowIndicies} from './panel/LineUpOrderedRowIndicies';
import {CustomVis} from './customVis/CustomVis';
import React, {createElement} from 'react';
import ReactDOM from 'react-dom';


export interface IPanelTabExtension {
  desc: IPanelTabExtensionDesc;

  /**
   * Create and attach a new LineUp side panel
   * @param tab PanelTab instance to attach the HTMLElement and listen to events
   * @param provider The data of the current ranking
   * @param desc The phovea extension point description
   */
  factory(desc: IPanelTabExtensionDesc, tab: PanelTab, provider: LocalDataProvider): void;
}

export interface IPanelTabExtensionDesc extends IPluginDesc {
  /**
   * CSS class for the PanelNavButton of the PanelTab
   */
  cssClass: string;

  /**
   * Title attribute PanelNavButton
   */
  title: string;

  /**
   * Customize the PanelNavButtons' position (recommended to use multiples of 10)
   */
  order: number;

  /**
   * Width of the PanelTab
   */
  width: string;

  /**
   * If true a shortcut button is appended to the SidePanel header in collapsed mode
   * @default false
   */
  shortcut?: boolean;

  load(): Promise<IPlugin & IPanelTabExtension>;
}


export class LineUpPanelActions extends EventHandler {
  static readonly EVENT_ZOOM_OUT = 'zoomOut';
  static readonly EVENT_ZOOM_IN = 'zoomIn';
  static readonly EVENT_OPEN_VIS = 'openVis';
  static readonly EVENT_TOGGLE_OVERVIEW = 'toggleOverview';
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
  readonly customVisDiv: HTMLElement; // wrapper node


  private readonly header: PanelHeader;
  private readonly tabContainer: ITabContainer;

  private overview: HTMLElement;
  private wasCollapsed = false;

  constructor(protected readonly provider: LocalDataProvider, ctx: IRankingHeaderContextContainer & IRenderContext & IEngineRankingContext, private readonly options: Readonly<IARankingViewOptions>, doc = document) {
    super();

    this.customVisDiv = doc.createElement('div')
    this.customVisDiv.id = "customVisDiv"
    this.customVisDiv.classList.add("custom-vis-panel")

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

    if (value) {
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

      const collapseButton = new PanelButton(buttons, I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.collapseButton'), 'collapse-button', listener);
      this.header.addButton(collapseButton);
    }

    if (this.options.enableAddingColumns) {
      const addColumnButton = new PanelAddColumnButton(buttons, this.searchBoxProvider.createSearchBox());
      this.header.addButton(addColumnButton);
    }

    this.appendExtraButtons(buttons);

    const lineupOrderRowIndices = new LineUpOrderedRowIndicies(this.provider); // save state of all, selected, and filtered rows

    if (this.options.enableSaveRanking) {
      const saveRankingButtonContainer = new PanelSaveNamedSetButton(buttons, lineupOrderRowIndices, this.isTopMode);
      saveRankingButtonContainer.on(PanelSaveNamedSetButton.EVENT_SAVE_NAMED_SET, (_event, order, name, description, sec) => {
        this.fire(LineUpPanelActions.EVENT_SAVE_NAMED_SET, order, name, description, sec); // forward event
      });
      this.header.addButton(saveRankingButtonContainer);
    }

    if (this.options.enableDownload) {
      const downloadButtonContainer = new PanelDownloadButton(buttons, this.provider, lineupOrderRowIndices, this.isTopMode);
      this.header.addButton(downloadButtonContainer);
    }

    if (this.options.enableZoom) {
      const zoomInButton = new PanelButton(buttons, I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.zoomIn'), 'fas fa-search-plus gap', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN));
      this.header.addButton(zoomInButton);

      const zoomOutButton = new PanelButton(buttons, I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.zoomOut'), 'fas fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT));
      this.header.addButton(zoomOutButton);
    }

    console.log("at the if")
    if (this.options.enableCustomVis) {
      console.log("making the button")
      const customVis = new PanelButton(buttons, I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.openVis'), 'fas fa-search-plus gap', () => this.fire(LineUpPanelActions.EVENT_OPEN_VIS));
      this.header.addButton(customVis);
    }

    if (this.options.enableOverviewMode) {
      const listener = () => {
        const selected = this.overview.classList.toggle('fa-th-list');
        this.overview.classList.toggle('fa-list');
        this.fire(LineUpPanelActions.EVENT_TOGGLE_OVERVIEW, selected);
      };
      const overviewButton = new PanelButton(buttons, I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.toggleOverview'), this.options.enableOverviewMode === 'active' ? 'fas fa-th-list' : 'fas fa-list', listener);
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
    const buttons = <IRankingButtonExtensionDesc[]>PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_RANKING_BUTTON);
    return buttons.map((button) => {
      const listener = () => {
        button.load().then((p) => this.scoreColumnDialog(p));
      };

      const luButton = new PanelRankingButton(parent, this.provider, button.title, 'fas ' + button.cssClass, listener);
      this.header.addButton(luButton);
    });
  }

  private appendExtraTabs() {
    const plugins = <IPanelTabExtensionDesc[]>PluginRegistry.getInstance().listPlugins(EP_TDP_CORE_LINEUP_PANEL_TAB).sort((a, b) => a.order - b.order);
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

  private getColumnDescription(descs: IAdditionalColumnDesc[] | IColumnDesc[], addScores: boolean) {
    return descs
      .filter((d) => Boolean((<any>d)._score) === addScores)
      .map((d) => {
        return {text: d.label, id: (<any>d).column.toString(), action: () => this.addColumn(d), chooserGroup: isAdditionalColumnDesc(d) ? d.chooserGroup : null};
      })
      .sort((a, b) => a.text.localeCompare(b.text));
  }

  private addColumn(desc: IColumnDesc) {
    const ranking = this.provider.getLastRanking();
    ranking.push(this.provider.create(desc));
  }

  private async resolveScores(idType: IDType) {
    // load plugins, which need to be checked if the IDTypes are mappable
    const ordinoScores: IPluginDesc[] = await findMappablePlugins(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_SCORE));
    const metaDataPluginDescs = <IScoreLoaderExtensionDesc[]>await findMappablePlugins(idType, PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_SCORE_LOADER));

    const metaDataPluginPromises: Promise<IGroupSearchItem<any>>[] = metaDataPluginDescs
      .map((plugin: IScoreLoaderExtensionDesc) => plugin.load()
        .then((loadedPlugin: IPlugin) => loadedPlugin.factory(plugin))
        .then((scores: IScoreLoader[]) => {
          return this.buildMetaDataDescriptions(plugin, scores.sort((a, b) => a.text.localeCompare(b.text)));
        })
      );

    // Load meta data plugins
    const metaDataOptions = await Promise.all(metaDataPluginPromises);
    const loadedScorePlugins = ordinoScores.map((desc) => LineupUtils.wrap(desc));
    return {metaDataOptions, loadedScorePlugins};
  }

  addCustomVis(data: any) {
    console.log(data)
    this.customVisDiv.style.display = "flex"

    let irisSepalLengthData = [5.1, 4.9, 4.7, 4.6, 5.0, 5.4, 4.6, 5.0, 5.5, 4.9, 5.4, 4.8, 4.8, 4.3, 5.8, 5.7, 5.4, 5.1, 5.7, 5.1];
    let irisSepalWidthData = [3.5, 3.0, 3.2, 3.1, 3.6, 3.9, 3.4, 3.4, 2.9, 3.1, 3.7, 3.4, 3.0, 3.0, 4.0, 4.4, 3.9, 3.5, 3.8, 3.8];
    let irisPetalLengthData = [1.4, 1.4, 1.3, 1.5, 1.4, 1.7, 1.4, 1.5, 1.4, 1.5, 1.5, 1.6, 1.4, 1.1, 1.2, 1.5, 1.3, 1.4, 1.7, 1.5];
    let irisPetalWidthData = [0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3];

    let irisSpecies = ["Setosa", "Setosa", "Setosa", "Setosa", "Setosa", "Setosa", "Versicolor", "Versicolor","Versicolor", "Versicolor","Versicolor", "Versicolor",
    "Virginica", "Virginica", "Virginica", "Virginica", "Virginica", "Virginica", "Virginica", "Virginica"]

    ReactDOM.render(
      React.createElement(CustomVis, {columns: [
        {name: "Sepal Length", vals: irisSepalLengthData, type: "Numerical"}, 
        {name: "Sepal Width", vals: irisSepalWidthData, type: "Numerical"}, 
        {name: "Petal Length", vals: irisPetalLengthData, type: "Numerical"}, 
        {name: "Petal Width", vals: irisPetalWidthData, type: "Numerical"}, 
        {name: "Species", vals: irisSpecies, type: "Categorical"}], type: "Chooser"}),
      this.customVisDiv
    )
  }

  async updateChooser(idType: IDType, descs: IAdditionalColumnDesc[] | IColumnDesc[]) {
    this.idType = idType;

    if (this.searchBoxProvider.length === 0) {
      return;
    }

    const {metaDataOptions, loadedScorePlugins} = await this.resolveScores(this.idType);

    const items: (ISearchOption | IGroupSearchItem<ISearchOption>)[] = [];

    if (this.options.enableAddingDatabaseColumns) {
      const columnDesc = this.getColumnDescription(descs, false);
      // Group the columns
      const [groupedItems, ungroupedItems] = this.groupColumnDescs(columnDesc);
      // First, add all the ungrouped columns
      items.push(this.groupedDialog(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.databaseColumns'), ungroupedItems));
      const sortOrder = (a: number | null, b: number | null) => {
        // Return the group with the higher order
        return a === b ? 0 : (a != null && b != null ? a - b : (a != null ? -1 : 1));
      };
      // Then, add the grouped columns with the ordered group and ordered columns
      Array.from(groupedItems.entries())
        .sort(([aKey, aVal], [bKey, bVal]) => {
          // Sort the groups first
          const {databaseColumnGroups} = this.options;
          // If both groups have the same order, sort alphabetically
          return sortOrder(databaseColumnGroups?.[aKey]?.order, databaseColumnGroups?.[bKey]?.order) || aKey.localeCompare(bKey);
        })
        .forEach(([key, value]) => items.push(this.groupedDialog(key, value.sort((a, b) => sortOrder(a.chooserGroup?.order, b.chooserGroup?.order)))));
    }

    if (this.options.enableAddingScoreColumns && loadedScorePlugins.length > 0) {
      items.push({
        text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.parameterizedScores'),
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
          text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.previouslyAddedColumns'),
          children: scoreDescs
        });
      }
    }

    const specialColumnsOption = {
      text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.specialColumns'),
      children: []
    };

    if (this.options.enableAddingCombiningColumns) {
      const combiningColumns = this.groupedDialog(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.combiningColumns'), [
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum'), id: 'weightedSum', action: () => this.addColumn(createStackDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.weightedSum')))},
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination'), id: 'scriptedCombination', action: () => this.addColumn(createScriptDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.scriptedCombination')))},
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.nested'), id: 'nested', action: () => this.addColumn(createNestedDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.nested')))},
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.reduce'), id: 'reduce', action: () => this.addColumn(createReduceDesc())},
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.imposition'), id: 'imposition', action: () => this.addColumn(createImpositionDesc())}
      ]);
      specialColumnsOption.children.push(combiningColumns);
    }

    if (this.options.enableAddingSupportColumns) {
      const supportColumns = this.groupedDialog(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.supportColumns'), [
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.groupInformation'), id: 'group', action: () => this.addColumn(createGroupDesc(I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.group')))},
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.selectionCheckbox'), id: 'selection', action: () => this.addColumn(createSelectionDesc())},
        {text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.aggregateGroup'), id: 'aggregate', action: () => this.addColumn(createAggregateDesc())}
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

  private groupColumnDescs(columnDesc: ISearchOption[]): [Map<string, ISearchOption[]>, ISearchOption[]] {
    const groupedItems = new Map<string, ISearchOption[]>();
    const ungroupedItems = [];
    columnDesc.map((item) => {
      if (item.chooserGroup) {
        groupedItems.has(item.chooserGroup.parent) ? groupedItems.set(item.chooserGroup.parent, [...groupedItems.get(item.chooserGroup.parent), item]) : groupedItems.set(item.chooserGroup.parent, [item]);
      } else {
        ungroupedItems.push(item);
      }
    });
    return [groupedItems, ungroupedItems];
  }

  private groupedDialog(text: string, children: ISearchOption[]): ISearchOption | IGroupSearchItem<ISearchOption> {
    const viaDialog = this.options.enableAddingColumnGrouping;
    if (!viaDialog) {
      return {text, children};
    }

    return {
      text: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.columnTitle', {text}),
      id: `group_${text}`,
      action: () => {
        // choooser dialog
        const dialogTitle = I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.addText', {text});
        const dialogButton = I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.addButton');

        const dialog = new FormDialog(dialogTitle, dialogButton);

        const CHOOSER_COLUMNS = 'chooser_columns';

        const formDesc = {
          type: FormElementType.SELECT2_MULTIPLE,
          label: 'Columns',
          id: CHOOSER_COLUMNS,
          required: true,
          options: {
            placeholder: 'Start typing...',
            data: children
          },
        };

        dialog.append(formDesc);

        dialog.showAsPromise((form: IForm) => {
          const data = <any>form.getElementData();
          const columns = data[CHOOSER_COLUMNS];
          columns.forEach((column) => {
            const child = children.find((c) => c.id === column.id);
            child.action();
          });
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
    return IDTypeManager.getInstance().getCanBeMappedTo(IDTypeManager.getInstance().resolveIdType(idtype)).then((mappables: IDType[]) => mappables.some((d) => d.id === target.id));
  }
  // check which idTypes can be mapped to the target one
  return Promise.all(idTypes.map(canBeMappedTo)).then((mappable: boolean[]) => {
    const valid = idTypes.filter((d, i) => mappable[i]);
    return all.filter((d) => valid.indexOf(d.idtype) >= 0);
  });
}
