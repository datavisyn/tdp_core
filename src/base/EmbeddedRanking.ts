import {IColumnDesc, LocalDataProvider} from 'lineupjs';
import {ProvenanceGraph} from 'phovea_core/src/provenance';
import {none, parse} from 'phovea_core/src/range';
import {ARankingView, IARankingViewOptions, IRow} from '../lineup';
import {IInitialRankingOptions} from '../lineup/desc';
import {IViewProvider} from '../lineup/internal/cmds';
import {resolve} from 'phovea_core/src/idtype';


interface IEmbeddedRanking extends ARankingView {
  rebuildLineUp(mode: 'data' | 'data+desc'): void;
  runWithoutTracking<T>(f: () => T): Promise<T>;
}

export abstract class AEmbeddedRanking<T extends IRow> implements IViewProvider {
  private ranking: IEmbeddedRanking;

  /**
   * available after the ranking has been built
   */
  data: LocalDataProvider;

  constructor(public readonly node: HTMLElement) {

  }

  getInstance() {
    return this.ranking;
  }

  protected buildRanking(graph: ProvenanceGraph, refKey: string, options: Partial<IARankingViewOptions> = {}) {
    const ref = graph.findOrAddObject(this, refKey);
    const idtype = resolve('_dummy');
    const context = {
      graph,
      ref,
      desc: <any>{
        idtype
      }
    };
    const selection = {
      idtype,
      range: none()
    };

    const that = this;

    class EmbeddedRankingView extends ARankingView implements IEmbeddedRanking {
      protected loadColumnDesc() {
        return Promise.resolve(that.loadColumnDescs()).then((columns: any[]) => ({columns}));
      }

      protected getColumnDescs(columns: any[]) {
        // columns already in the right format
        return columns.map((c) => Object.assign(c, {
          initialRanking: true,
          width: -1,
          selectedId: -1,
          selectedSubtype: undefined
        }, c));
      }

      protected loadRows() {
        return Promise.resolve(that.loadRows());
      }

      rebuildLineUp(mode: 'data' | 'data+desc' = 'data') {
        if (mode === 'data') {
          this.reloadData();
        } else {
          this.rebuild();
        }
      }

      protected createInitialRanking(lineup: LocalDataProvider, options: Partial<IInitialRankingOptions> = {}) {
        that.createInitialRanking(lineup);
        if (lineup.getRankings().length === 0) {
          super.createInitialRanking(lineup, options);
        }
      }

      runWithoutTracking<T>(f: () => T): Promise<T> {
        return super.withoutTracking(f);
      }
    }

    this.ranking = new EmbeddedRankingView(context, selection, this.node, options);

    // since set in the constructor it is safe
    const lineup = this.data;
    lineup.on(LocalDataProvider.EVENT_SELECTION_CHANGED + '.embedded', (selection: number[]) => {
      const rows = selection.map((d) => lineup.data[d]);
      this.selectedRowsChanged(rows);
    });

    const dummy = this.node.ownerDocument.createElement('div');
    this.ranking.init(dummy, () => null);
    return lineup;
  }

  protected abstract loadColumnDescs(): Promise<IColumnDesc[]> | IColumnDesc[];
  protected abstract loadRows(): Promise<T[]> | T[];
  protected abstract createInitialRanking(lineup: LocalDataProvider): void;

  protected selectedRowsChanged(_rows: T[]) {
    // hook
  }

  protected setSelectedRows(rows: T[]) {
    const lineup = this.data;
    lineup.on(LocalDataProvider.EVENT_SELECTION_CHANGED + '.embedded', null);
    this.ranking.setItemSelection({
      idtype: this.ranking.itemIDType,
      range: parse(rows.map((d) => d._id))
    });
    lineup.on(LocalDataProvider.EVENT_SELECTION_CHANGED + '.embedded', (selection: number[]) => {
      const rows = selection.map((d) => lineup.data[d]);
      this.selectedRowsChanged(rows);
    });
  }

  protected rebuild(mode: 'data' | 'data+desc' = 'data') {
    if (this.ranking) {
      this.ranking.rebuildLineUp(mode);
    }
  }

  protected runWithoutTracking<T>(f: (lineup: LocalDataProvider) => T): Promise<T> {
    return this.ranking.runWithoutTracking(() => f(this.data));
  }

  update() {
    if (this.ranking) {
      this.ranking.update();
    }
  }
}
