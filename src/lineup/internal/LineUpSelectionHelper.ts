import {EventHandler, ISelection} from '../../base';
import {IRow} from '../../base/rest';
import {LocalDataProvider} from 'lineupjs';
import {LineupUtils} from '../utils';
import {IDType} from '../../idtype';
import {Range} from '../../range';


export class LineUpSelectionHelper extends EventHandler {
  static readonly EVENT_SET_ITEM_SELECTION = 'setItemSelection';

  private _rows: IRow[] = [];

  /**
   * selected indices ordered by selection order, i.e. the first selected is the 0. item
   * @type {number[]}
   */
  private readonly orderedSelectedIndices = <number[]>[];
  private uid2index = new Map<number, number>();

  constructor(private readonly provider: LocalDataProvider, private readonly idType: () => IDType) {
    super();
    this.addEventListener();
  }

  private buildCache() {
    this.uid2index.clear();
    // create lookup cache
    this._rows.forEach((row, i) => {
      this.uid2index.set(row._id, i);
    });
    // fill up id cache for faster mapping
    const idType = this.idType();
    if (!idType) {
      console.error('no idType defined for this view');
      return;
    }
    idType.fillMapCache(this._rows.map((r) => r._id), this._rows.map((r) => String(r.id)));
  }

  private addEventListener() {
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED, (indices: number[]) => {
      this.onMultiSelectionChanged(indices);
    });
  }

  private removeEventListener() {
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED, null);
  }

  private onMultiSelectionChanged(indices: number[]) {
    // compute the difference
    const diffAdded = [...LineupUtils.set_diff(new Set(indices), new Set(this.orderedSelectedIndices))];
    const diffRemoved = [...LineupUtils.set_diff(new Set(this.orderedSelectedIndices), new Set(indices))];

    // remove elements within, but preserve order
    diffRemoved.forEach((d) => {
      this.orderedSelectedIndices.splice(this.orderedSelectedIndices.indexOf(d), 1);
    });

    // add new element to the end
    diffAdded.forEach((d) => {
      this.orderedSelectedIndices.push(d);
    });


    const uids = Range.list(this.orderedSelectedIndices.map((i) => this._rows[i]._id));
    //console.log(this.orderedSelectionIndicies, ids.toString(), diffAdded, diffRemoved);

    const idType = this.idType();
    if (!idType) {
      console.warn('no idType defined for this ranking view');
      return;
    }
    const selection: ISelection = {idtype: idType, range: uids};
    // Note: listener of that event calls LineUpSelectionHelper.setItemSelection()
    this.fire(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, selection);
  }

  set rows(rows: IRow[]) {
    this._rows = rows;
    this.buildCache();
  }

  get rows(): IRow[] {
    return this._rows;
  }

  /**
   * gets the rows ids as a set, i.e. the order doesn't mean anything
   */
  rowIdsAsSet(indices: number[]) {
    let ids: number[];
    if (indices.length === this._rows.length) {
      //all
      ids = this._rows.map((d) => d._id);
    } else {
      ids = indices.map((i) => this._rows[i]._id);
    }
    ids.sort((a, b) => a - b); // sort by number
    return Range.list(ids);
  }

  setItemSelection(sel: ISelection) {
    if (!this.provider) {
      return;
    }

    const old = this.provider.getSelection().sort((a, b) => a - b);

    const indices: number[] = [];
    sel.range.dim(0).forEach((uid) => {
      const index = this.uid2index.get(uid);
      if (typeof index === 'number') {
        indices.push(index);
      }
    });
    indices.sort((a, b) => a - b);

    if (old.length === indices.length && indices.every((v, j) => old[j] === v)) {
      return; // no change
    }

    this.removeEventListener();
    this.provider.setSelection(indices);
    this.addEventListener();
  }

  setGeneralVisSelection(sel: ISelection) {
    if (!this.provider) {
      return;
    }

    const old = this.provider.getSelection().sort((a, b) => a - b);

    const indices: number[] = [];
    sel.range.dim(0).forEach((uid) => {
      const index = this.uid2index.get(uid);
      if (typeof index === 'number') {
        indices.push(index);
      }
    });
    indices.sort((a, b) => a - b);

    if (old.length === indices.length && indices.every((v, j) => old[j] === v)) {
      return; // no change
    }

    this.provider.setSelection(indices);
  }

}
