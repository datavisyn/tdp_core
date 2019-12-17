
import {SidePanel, spaceFillingRule, IGroupSearchItem, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, isSupportType, Column, IItem} from 'lineupjs';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {IPlugin, IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import {editDialog} from '../../storage';
import {
  IScoreLoader, EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON,
  IScoreLoaderExtensionDesc, IRankingButtonExtension, IRankingButtonExtensionDesc, EXTENSION_POINT_TDP_LINEUP_PANEL_TAB
} from '../../extensions';
import {EventHandler} from 'phovea_core/src/event';
import {IARankingViewOptions} from '../ARankingView';
import {exportLogic} from './export';
import {lazyDialogModule} from '../../dialogs';

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

class LineUpSearchBoxProvider {

  private searchBoxes: SearchBox<ISearchOption>[] = [];

  private idType: IDType | null = null;

  constructor(private provider: LocalDataProvider, private options: any) {

  }

  get length(): number {
    return this.searchBoxes.length;
  }

  createSearchBox(): SearchBox<ISearchOption> {
    const searchBox = new SearchBox<ISearchOption>({
      placeholder: 'Add Column...'
    });

    searchBox.on(SearchBox.EVENT_SELECT, (item) => {
      item.action();
    });

    this.searchBoxes = [...this.searchBoxes, searchBox];

    return searchBox;
  }

  update(items: (ISearchOption | IGroupSearchItem<ISearchOption>)[]) {
    this.searchBoxes.forEach((searchBox) => searchBox.data = items);
  }
}


interface ILineUpPanelButton {
  readonly node: HTMLElement;
}

class LineUpPanelHeader {

  readonly node: HTMLElement;

  private buttons: ILineUpPanelButton[] = [];

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('header');
    parent.appendChild(this.node);
  }

  addButton(button: ILineUpPanelButton) {
    this.buttons = [...this.buttons, button];
    this.node.appendChild(button.node);
  }

}


class LineUpPanelButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, title: string, linkClass: string, onClick: () => void) {
    this.node = parent.ownerDocument.createElement('button');
    this.node.className = linkClass;
    this.node.title = title;
    this.node.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      onClick();
    });
  }
  public highlight() {
    this.node.style.color = 'orange';
  }
}

class LineUpPanelRankingButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private provider: LocalDataProvider, title: string, linkClass: string, onClick: (ranking: Ranking) => void) {
    this.node = parent.ownerDocument.createElement('button');
    this.node.className = linkClass;
    this.node.title = title;
    this.node.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      const first = this.provider.getRankings()[0];
      if (first) {
        onClick(first);
      }
    });
  }
}

class LineUpPanelDownloadButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private provider: LocalDataProvider, isTopMode: boolean) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('btn-group', 'download-data-dropdown');
    this.node.innerHTML = `
      <button type="button" class="dropdown-toggle fa fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Download Data">
      </button>
      <ul class="dropdown-menu dropdown-menu-${isTopMode ? 'left' : 'right'}">
        <li class="dropdown-header">Download All Rows</li>
        <li><a href="#" data-s="a" data-t="xlsx">Microsoft Excel (xlsx)</a></li>
        <li class="dropdown-header" data-num-selected-rows="0">Download Selected Rows Only</li>
        <li><a href="#" data-s="s" data-t="xlsx">Microsoft Excel (xlsx)</a></li>
        <li role="separator" class="divider"></li>
        <li><a href="#" data-s="s" data-t="custom">Customize &hellip;</a></li>
      </ul>
    `;

    // Listen for row selection and update number of selected rows
    // Show/hide some dropdown menu points accordingly using CSS
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + '.download-menu', (indices: number[]) => {
      (<HTMLElement>this.node.querySelector('[data-num-selected-rows]')).dataset.numSelectedRows = indices.length.toString();
    });

    const links = Array.from(this.node.querySelectorAll('a'));
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

}

class LineUpPanelAddColumnButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('lu-adder');

    this.node.addEventListener('mouseleave', () => {
      this.node.classList.remove('once');
    });

    const button = this.node.ownerDocument.createElement('button');
    button.classList.add('fa', 'fa-plus');
    button.title = 'Add Column';

    button.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.node.classList.add('once');
      (<HTMLElement>this.search.node.querySelector('input'))!.focus();
      this.search.focus();
    });

    this.node.appendChild(button);
    this.node.appendChild(this.search.node);
  }
}


class LineUpPanelTabContainer {

  readonly node: HTMLElement;

  private tabs: LineUpPanelTab[] = [];

  private currentTab: LineUpPanelTab;

  constructor(parent: HTMLElement) {
    this.node = parent.ownerDocument.createElement('main');
    this.node.classList.add('tab-content');
    parent.appendChild(this.node);
  }

  private get defaultTab(): LineUpPanelTab {
    return this.tabs[0];
  }

  addTab(tab: LineUpPanelTab) {
    this.tabs = [...this.tabs, tab];
    this.node.appendChild(tab.node);
  }

  toggle(tab: LineUpPanelTab) {
    if (this.currentTab === tab) {
      this.hide(tab);

    } else {
      this.show(tab);
    }
  }

  show(tab: LineUpPanelTab) {
    if (this.currentTab) {
      this.currentTab.hide();
    }

    tab.show();
    this.currentTab = tab;
  }

  hide(tab: LineUpPanelTab) {
    tab.hide();
    this.defaultTab.show();
    this.currentTab = this.defaultTab;
  }

}


interface ILineUpPanelTabOptions {
  width: string;
}

class LineUpPanelTab {

  readonly node: HTMLElement;

  constructor(parent: HTMLElement, cssClass: string, options?: Partial<ILineUpPanelTabOptions>) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('tab-pane', cssClass);

    const o = Object.assign({}, options);
    this.node.style.width = o.width || null;
  }

  show() {
    this.node.classList.add('active');
  }

  hide() {
    this.node.classList.remove('active');
  }
}

class LineUpSidePanelTab extends LineUpPanelTab {

  readonly panel: SidePanel | null;

  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>, ctx: any, doc = document) {
    super(parent);

    this.panel = new SidePanel(ctx, doc, {
      chooser: false
    });

    this.node.appendChild(this.search.node);
    this.node.appendChild(this.panel.node);
  }

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

  private readonly searchBoxProvider: LineUpSearchBoxProvider;

  readonly panel: SidePanel | null;
  readonly node: HTMLElement; // wrapper node

  private readonly header: LineUpPanelHeader;
  private readonly tabContainer: LineUpPanelTabContainer;

  private overview: HTMLElement;
  private wasCollapsed = false;

  constructor(protected readonly provider: LocalDataProvider, ctx: any, private readonly options: Readonly<IARankingViewOptions>, doc = document) {
    super();

    this.node = doc.createElement('aside');
    this.node.classList.add('lu-side-panel-wrapper');

    this.header = new LineUpPanelHeader(this.node);

    this.searchBoxProvider = new LineUpSearchBoxProvider(provider, options);

    // this.options.enableSidePanel = 'top';

    if (this.options.enableSidePanel === 'top') {
      this.node.classList.add('lu-side-panel-top');

    } else {
      const sidePanel = new LineUpSidePanelTab(this.node, this.searchBoxProvider.createSearchBox(), ctx, doc);
      this.panel = sidePanel.panel;

      this.tabContainer = new LineUpPanelTabContainer(this.node);
      this.tabContainer.addTab(sidePanel);
      this.tabContainer.show(sidePanel);
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
    const buttons = this.header.node;

    if (!this.isTopMode && this.options.enableSidePanelCollapsing) { // top mode doesn't need collapse feature
      const listener = () => {
        this.collapse = !this.collapse;
      };

      const collapseButton = new LineUpPanelButton(buttons, '(Un)Collapse', 'collapse-button', listener);
      this.header.addButton(collapseButton);
    }

    if (this.options.enableAddingColumns) {
      const addColumnButton = new LineUpPanelAddColumnButton(buttons, this.searchBoxProvider.createSearchBox());
      this.header.addButton(addColumnButton);
    }

    this.appendExtraButtons(buttons);

    if (this.options.enableSaveRanking) {
      const listener = (ranking: Ranking) => {
        editDialog(null, (name, description, sec) => {
          this.fire(LineUpPanelActions.EVENT_SAVE_NAMED_SET, ranking.getOrder(), name, description, sec);
        });
      };

      const saveRankingButton = new LineUpPanelRankingButton(buttons, this.provider, 'Save List of Entities', 'fa fa-save', listener);
      this.header.addButton(saveRankingButton);
    }

    if (this.options.enableDownload) {
      const downloadButton = new LineUpPanelDownloadButton(buttons, this.provider, this.isTopMode);
      this.header.addButton(downloadButton);
    }

    if (this.options.enableZoom) {
      const zoomInButton = new LineUpPanelButton(buttons, 'Zoom In', 'fa fa-search-plus gap', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN));
      this.header.addButton(zoomInButton);

      const zoomOutButton = new LineUpPanelButton(buttons, 'Zoom Out', 'fa fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT));
      this.header.addButton(zoomOutButton);
    }

    if (this.options.enableOverviewMode) {
      const listener = () => {
        const selected = this.overview.classList.toggle('fa-th-list');
        this.overview.classList.toggle('fa-list');
        this.fire(LineUpPanelActions.EVENT_RULE_CHANGED, selected ? rule : null);
      };
      const overviewButton = new LineUpPanelButton(buttons, 'En/Disable Overview', this.options.enableOverviewMode === 'active' ? 'fa fa-th-list' : 'fa fa-list', listener);
      this.overview = overviewButton.node; // TODO might be removed
      this.header.addButton(overviewButton);
    }

    if (!this.isTopMode) {
      this.appendExtraTabs(buttons).forEach((button: LineUpPanelButton) => {
        this.header.addButton(button);
      });
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

      const luButton = new LineUpPanelRankingButton(parent, this.provider, button.title, 'fa ' + button.cssClass, listener);
      this.header.addButton(luButton);
    });
  }

  private appendExtraTabs(buttons: HTMLElement) {
    const plugins = <IRankingButtonExtensionDesc[]>listPlugins(EXTENSION_POINT_TDP_LINEUP_PANEL_TAB);
    return plugins.map((plugin) => {
      const tab = new LineUpPanelTab(this.tabContainer.node, 'fa ' + plugin.cssClass, plugin.tabWidth);
      this.tabContainer.addTab(tab);

      let isLoaded = false;

      const listener = () => {
        if (isLoaded) {
          if (this.collapse) {
            this.collapse = false; // expand side panel
            this.tabContainer.show(tab);

          } else {
            this.tabContainer.toggle(tab);
          }

        } else {
          plugin.load().then((p) => {
            p.factory(tab.node, this.provider, p.desc);

            this.collapse = false; // expand side panel
            this.tabContainer.show(tab);

            isLoaded = true;
          });
        }
      };
      return new LineUpPanelButton(buttons, plugin.title, 'fa ' + plugin.cssClass, listener);
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
      items.push(this.groupedDialog('Database Columns', this.getColumnDescription(descs, false)));
    }

    if (this.options.enableAddingScoreColumns && loadedScorePlugins.length > 0) {
      items.push({
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
      });
    }

    if (this.options.enableAddingPreviousColumns) {
      const scoreDescs = this.getColumnDescription(descs, true);
      if (scoreDescs.length > 0) {
        items.push({
          text: 'Previously Added Columns',
          children: scoreDescs
        });
      }
    }

    const specialColumnsOption = {
      text: 'Special Columns',
      children: []
    };

    if (this.options.enableAddingCombiningColumns) {
      const combiningColumns = this.groupedDialog('Combining Columns', [
        {text: 'Weighted Sum', id: 'weightedSum', action: () => this.addColumn(createStackDesc('Weighted Sum'))},
        {text: 'Scripted Combination', id: 'scriptedCombination', action: () => this.addColumn(createScriptDesc('Scripted Combination'))},
        {text: 'Nested', id: 'nested', action: () => this.addColumn(createNestedDesc('Nested'))},
        {text: 'Min/Max/Mean Combination', id: 'reduce', action: () => this.addColumn(createReduceDesc())},
        {text: 'Imposition', id: 'imposition', action: () => this.addColumn(createImpositionDesc())}
      ]);
      specialColumnsOption.children.push(combiningColumns);
    }

    if (this.options.enableAddingSupportColumns) {
      const supportColumns = this.groupedDialog('Support Columns', [
        {text: 'Group Information', id: 'group', action: () => this.addColumn(createGroupDesc('Group'))},
        {text: 'Selection Checkbox', id: 'selection', action: () => this.addColumn(createSelectionDesc())},
        {text: 'Aggregate Group', id: 'aggregate', action: () => this.addColumn(createAggregateDesc())}
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
      text: `${text} &hellip;`,
      id: `group_${text}`,
      action: () => {
        // choooser dialog
        lazyDialogModule().then((dialogs) => {
          const dialog = new dialogs.FormDialog(`Add ${text} &hellip;`, 'Add Column');
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
