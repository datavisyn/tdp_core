
import {SidePanel, spaceFillingRule, IGroupSearchItem, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, isSupportType, Column} from 'lineupjs';
import {IDType, resolve} from 'phovea_core/src/idtype';
import {IPlugin, IPluginDesc, list as listPlugins} from 'phovea_core/src/plugin';
import {editDialog} from '../../storage';
import {
  IScoreLoader, EXTENSION_POINT_TDP_SCORE_LOADER, EXTENSION_POINT_TDP_SCORE, EXTENSION_POINT_TDP_RANKING_BUTTON,
  IScoreLoaderExtensionDesc, IRankingButtonExtension, IRankingButtonExtensionDesc
} from '../../extensions';
import {EventHandler} from 'phovea_core/src/event';
import {IARankingViewOptions, MAX_AMOUNT_OF_ROWS_TO_DISABLE_OVERVIEW} from '../ARankingView';
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

  readonly panel: SidePanel;
  private overview: HTMLElement;
  private wasCollapsed = false;

  constructor(protected readonly provider: LocalDataProvider, ctx: any, private readonly options: Readonly<IARankingViewOptions>, doc = document) {
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

  get wasHidden() {
    return this.node.style.display === 'none';
  }

  get node() {
    return this.panel.node;
  }

  protected init() {
    this.node.insertAdjacentHTML('afterbegin', `
      <a href="#" title="(Un)Collapse"></a>
      <section></section>
      <div class="lu-adder">${this.search ? '<button class="fa fa-plus" title="Add Column"></button>' : ''}
      </div>`);

    this.node.querySelector('a')!.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.collapse = !this.collapse;
    });

    const buttons = this.node.querySelector('section');
    this.appendExtraButtons().forEach((b) => buttons.appendChild(b));
    buttons.appendChild(this.appendSaveRanking());
    buttons.appendChild(this.appendDownload());
    if (this.options.enableZoom) {
      buttons.appendChild(this.createMarkup('Zoom In', 'fa fa-search-plus gap', () => this.fire(LineUpPanelActions.EVENT_ZOOM_IN)));
      buttons.appendChild(this.createMarkup('Zoom Out', 'fa fa-search-minus', () => this.fire(LineUpPanelActions.EVENT_ZOOM_OUT)));
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

  protected createMarkup(title: string, linkClass: string, onClick: (ranking: Ranking) => void) {
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
    return this.overview = this.createMarkup('En/Disable Overview', this.options.enableOverviewMode === 'active' ? 'fa fa-th-list' : 'fa fa-list', listener);
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
    node.classList.add('btn-group');
    node.innerHTML = `
      <button type="button" class="dropdown-toggle fa fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Download Data">
      </button>
      <ul class="dropdown-menu dropdown-menu-right">
        <li class="dropdown-header">Download All Rows</li>
        <li><a href="#" data-s="a" data-t="csv">CSV (comma separated)</a></li>
        <li><a href="#" data-s="a" data-t="tsv">TSV (tab separated)</a></li>
        <li><a href="#" data-s="a" data-t="ssv">CSV (semicolon separated)</a></li>
        <li><a href="#" data-s="a" data-t="json">JSON</a></li>
        <li><a href="#" data-s="a" data-t="xlsx">Microsoft Excel (xlsx)</a></li>
        <li class="dropdown-header">Download Selected Rows Only</li>
        <li><a href="#" data-s="s" data-t="csv">CSV (comma separated)</a></li>
        <li><a href="#" data-s="s" data-t="tsv">TSV (tab separated)</a></li>
        <li><a href="#" data-s="a" data-t="ssv">CSV (semicolon separated)</a></li>
        <li><a href="#" data-s="s" data-t="json">JSON</a></li>
        <li><a href="#" data-s="s" data-t="xlsx">Microsoft Excel (xlsx)</a></li>
        <li role="separator" class="divider"></li>
        <li><a href="#" data-s="s" data-t="custom">Customize &hellip;</a></li>
      </ul>
    `;

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

    return this.createMarkup('Save List of Entities', 'fa fa-save', listener);
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

    const items = [
      this.groupedDialog('Database Columns', this.getColumnDescription(descs, false))
    ];
    if (loadedScorePlugins.length > 0) {
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
    const scoreDescs = this.getColumnDescription(descs, true);
    if (scoreDescs.length > 0) {
      items.push({
        text: 'Previously Added Columns',
        children: scoreDescs
      });
    }
    items.push(
      this.groupedDialog('Combining Columns', [
          { text: 'Weighted Sum', id: 'weightedSum', action: () => this.addColumn(createStackDesc('Weighted Sum')) },
          { text: 'Scripted Combination', id: 'scriptedCombination', action: () => this.addColumn(createScriptDesc('Scripted Combination')) },
          { text: 'Nested', id: 'nested', action: () => this.addColumn(createNestedDesc('Nested')) },
          { text: 'Min/Max/Mean Combination', id: 'reduce', action: () => this.addColumn(createReduceDesc()) },
          { text: 'Imposition', id: 'imposition', action: () => this.addColumn(createImpositionDesc()) }
      ]),
      this.groupedDialog('Support Columns', [
          {text: 'Group Information', id: 'group', action: () => this.addColumn(createGroupDesc('Group'))},
          {text: 'Selection Checkbox', id: 'selection', action: () => this.addColumn(createSelectionDesc())},
          {text: 'Aggregate Group', id: 'aggregate', action: () => this.addColumn(createAggregateDesc())}
      ]),
      ...metaDataOptions
    );
    this.search.data = items;
  }

  private groupedDialog(text: string, children: ISearchOption[]) {
    const viaDialog = this.options.enableAddingColumnGrouping;
    if (!viaDialog) {
      return { text, children };
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

  toggleDisableOverviewButton(disable: boolean = false) {
    if (!this.options.enableOverviewMode) {
      return;
    }

    (<HTMLButtonElement>this.overview).disabled = disable;
    if (disable) {
      this.overview.title = `Overview disabled due to too many items in the table. Please filter the table below the threshold of ${MAX_AMOUNT_OF_ROWS_TO_DISABLE_OVERVIEW} items to enable the overview mode.`;
      this.overview.style.cursor = 'not-allowed';
    } else {
      this.overview.title = `En/Disable Overview`;
      this.overview.style.cursor = null; // remove style on element to use default style from stylesheet instead
    }
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
