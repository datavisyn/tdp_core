import { IColumnDesc, LocalDataProvider } from 'lineupjs';
import { IRow } from 'visyn_core/base';
import { IDTypeManager } from 'visyn_core/idtype';
import { PluginRegistry } from 'visyn_core/plugin';
import { ProvenanceGraph, ObjectRefUtils } from '../clue/provenance';
import { ARankingView } from '../lineup/ARankingView';
import { IARankingViewOptions } from '../lineup/IARankingViewOptions';
import { IInitialRankingOptions } from '../lineup/desc';
import { IViewProviderLocal } from '../lineup/internal/cmds';
import { EXTENSION_POINT_TDP_SCORE_IMPL } from '../base/extensions';
import { IScore } from '../base/interfaces';
import { IServerColumnDesc } from '../base/rest';
import { IFormElementDesc } from '../form/interfaces';
import { ILazyLoadedColumn } from '../lineup/internal/column';

export interface IEmbeddedRanking extends ARankingView {
  rebuildLineUp(mode: 'data' | 'scores' | 'data+scores' | 'data+desc+scores' | 'data+desc'): Promise<any>;
  runWithoutTracking<T>(f: () => T): Promise<T>;
}

export abstract class AEmbeddedRanking<T extends IRow> implements IViewProviderLocal {
  private ranking: IEmbeddedRanking;

  /**
   * available after the ranking has been built
   */
  data: LocalDataProvider;

  constructor(public readonly node: HTMLElement) {}

  getInstance() {
    return this.ranking;
  }

  protected buildRanking(graph: ProvenanceGraph, refKey: string, options: Partial<IARankingViewOptions> = {}) {
    const ref = graph.findOrAddObject(this, refKey, ObjectRefUtils.category.visual);
    const idtype = IDTypeManager.getInstance().resolveIdType('_dummy');
    const context = {
      graph,
      ref,
      desc: <any>{
        idtype: idtype.id,
      },
    };
    const selection = {
      idtype,
      ids: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;

    class EmbeddedRankingView extends ARankingView implements IEmbeddedRanking {
      private triggerScoreReload = false;

      protected loadColumnDesc(): Promise<IServerColumnDesc> {
        return Promise.resolve(that.loadColumnDescs()).then((columns: any[]) => ({ columns, idType: this.idType.name }));
      }

      protected getColumnDescs(columns: any[]) {
        // columns already in the right format
        return columns.map((c) =>
          Object.assign(c, {
            initialRanking: true,
            width: -1,
            selectedId: null,
            selectedSubtype: undefined,
            ...c,
          }),
        );
      }

      protected loadRows() {
        return Promise.resolve(that.loadRows());
      }

      rebuildLineUp(mode: 'data' | 'scores' | 'data+scores' | 'data+desc+scores' | 'data+desc' = 'data'): Promise<any> {
        switch (mode) {
          case 'scores':
            return this.reloadScores();
          case 'data':
            return this.reloadData();
          case 'data+scores':
            this.triggerScoreReload = true;
            return this.reloadData();
          case 'data+desc':
            return this.rebuild();
          case 'data+desc+scores':
            this.triggerScoreReload = true;
            return this.rebuild();
          default:
            return undefined;
        }
      }

      protected setLineUpData(rows: IRow[]) {
        super.setLineUpData(rows);
        // maybe trigger a score reload if needed
        if (this.triggerScoreReload) {
          this.triggerScoreReload = false;
          setTimeout(() => this.reloadScores(), 200); // HACK: wait until lineup has finished creating its new order before the score is reloaded
        }
      }

      protected createInitialRanking(lineup: LocalDataProvider, opts: Partial<IInitialRankingOptions> = {}) {
        that.createInitialRanking(lineup);
        if (lineup.getRankings().length === 0) {
          super.createInitialRanking(lineup, opts);
        }
      }

      runWithoutTracking<D>(f: () => D): Promise<D> {
        return super.withoutTracking(f);
      }

      protected getParameterFormDescs(): IFormElementDesc[] {
        const base = super.getParameterFormDescs();
        return [...base, ...that.getParameterFormDescs()];
      }
    }

    this.ranking = new EmbeddedRankingView(context, selection, this.node, options);

    // since set in the constructor it is safe
    // this.data is set by ARankingView's constructor (see hack where `this.context.ref.value.data` is set)
    // with `graph.findOrAddObject` above the reference of `this` (AEmbeddedRanking) is set to `this.context.ref.value` in ARankingView
    // therefore is this.data of AEmbeddedRanking === `this.context.ref.value` in ARankingView's constructor
    const lineup = this.data;
    lineup.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.embedded`, (sel: number[]) => {
      const rows = sel.map((d) => lineup.data[d]);
      this.selectedRowsChanged(rows);
    });

    const form = this.node.ownerDocument.createElement('div');
    form.classList.add('parameters', 'container-fluid', 'ps-0', 'pe-0');
    this.node.insertAdjacentElement('afterbegin', form);
    return Promise.resolve(this.ranking.init(form, () => null)).then(() => {
      this.initialized();
      return lineup;
    });
  }

  protected abstract loadColumnDescs(): Promise<IColumnDesc[]> | IColumnDesc[];
  protected abstract loadRows(): Promise<T[]> | T[];
  protected abstract createInitialRanking(lineup: LocalDataProvider): void;

  protected selectedRowsChanged(_rows: T[]) {
    // hook
  }

  protected initialized() {
    // hook
  }

  protected setSelectedRows(rows: T[]) {
    const lineup = this.data;
    lineup.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.embedded`, null);
    this.ranking.setItemSelection({
      idtype: this.ranking.itemIDType,
      ids: rows.map((d) => d.id),
    });
    lineup.on(`${LocalDataProvider.EVENT_SELECTION_CHANGED}.embedded`, (selection: number[]) => {
      const rs = selection.map((d) => lineup.data[d]);
      this.selectedRowsChanged(rs);
    });
  }

  protected async rebuild(mode: 'data' | 'scores' | 'data+scores' | 'data+desc+scores' | 'data+desc' = 'data'): Promise<void> {
    if (this.ranking) {
      return this.ranking.rebuildLineUp(mode);
    }
    return undefined;
  }

  protected runWithoutTracking<D>(f: (lineup: LocalDataProvider) => D): Promise<D> {
    return this.ranking.runWithoutTracking(() => f(this.data));
  }

  protected addTrackedScoreColumn(scoreId: string, scoreParams: any, position?: number): Promise<ILazyLoadedColumn[]>;
  protected addTrackedScoreColumn(score: IScore<any>, position?: number): Promise<ILazyLoadedColumn>;
  protected addTrackedScoreColumn(score: IScore<any> | string, scoreParams: any, position?: number): Promise<ILazyLoadedColumn | ILazyLoadedColumn[]> {
    if (typeof score !== 'string') {
      return this.ranking.addTrackedScoreColumn(score, scoreParams); // aka scoreParams = position
    }

    const pluginDesc = PluginRegistry.getInstance().getPlugin(EXTENSION_POINT_TDP_SCORE_IMPL, score);
    return pluginDesc.load().then((plugin) => {
      const instance: IScore<any> | IScore<any>[] = plugin.factory(scoreParams, pluginDesc);
      const scores = Array.isArray(instance) ? instance : [instance];
      return Promise.all(scores.map((s) => this.ranking.addTrackedScoreColumn(s, position)));
    });
  }

  update() {
    if (this.ranking) {
      this.ranking.update();
    }
  }

  /**
   * return a list of FormBuilder element descriptions to build the parameter form
   * @returns {IFormElementDesc[]}
   */
  protected getParameterFormDescs(): IFormElementDesc[] {
    // hook
    return [];
  }
}
