/**
 * Created by sam on 13.02.2017.
 */

import {ISelection} from '../views';
import LineUp from 'lineupjs/src/lineup';
import {IDType} from 'phovea_core/src/idtype';
import {list as rlist} from 'phovea_core/src/range';
import {EventHandler} from 'phovea_core/src/event';


/**
 * Returns the all items that are not in the given two arrays
 * TODO improve performance of diff algorithm
 * @param array1
 * @param array2
 * @returns {any}
 */
export function array_diff<T>(array1: T[], array2: T[]) {
  return array1.filter((elm) => array2.indexOf(elm) === -1);
}

/**
 * Returns all elements from set1 which are not in set2
 * @param set1
 * @param set2
 * @returns Set<T>
 */
export function set_diff<T>(set1: Set<T>, set2: Set<T>) : Set<T> {
  const diff = new Set<T>();
  set1.forEach((elem) => {
    if(!set2.has(elem)) {
      diff.add(elem);
    }
  });
  return diff;
}

export interface IRow {
  /**
   * id, e.g. ESNGxxxx
   */
  id: string;
  /**
   * unique internal number id, e.g. 42
   */
  _id: number;
}

export class LineUpSelectionHelper extends EventHandler {
  static readonly EVENT_SET_ITEM_SELECTION = 'setItemSelection';

  private _rows: {id: string, _id: number}[] = [];

  /**
   * selected indices ordered by selection order, i.e. the first selected is the 0. item
   * @type {number[]}
   */
  private readonly orderedSelectedIndices = <number[]>[];
  private uid2index = new Map<number, number>();

  constructor(private readonly lineup: LineUp, private readonly idType: IDType) {
    super();
  }

  init() {
    this.buildCache();
    this.addEventListener();
  }

  private buildCache() {
    // create lookup cache
    this._rows.forEach((row, i) => {
      this.uid2index.set(row._id, i);
    });
  }

  private addEventListener() {
    this.lineup.on(LineUp.EVENT_MULTISELECTION_CHANGED, (indices: number[]) => {
      this.onMultiSelectionChanged(indices);
    });
  }

  private removeEventListener() {
    this.lineup.on(LineUp.EVENT_MULTISELECTION_CHANGED, null);
  }

  private onMultiSelectionChanged(indices: number[]) {
    // compute the difference
    const diffAdded = array_diff(indices, this.orderedSelectedIndices);
    const diffRemoved = array_diff(this.orderedSelectedIndices, indices);

    // remove elements within, but preserve order
    diffRemoved.forEach((d) => {
      this.orderedSelectedIndices.splice(this.orderedSelectedIndices.indexOf(d), 1);
    });

    // add new element to the end
    diffAdded.forEach((d) => {
      this.orderedSelectedIndices.push(d);
    });


    const uids = rlist(this.orderedSelectedIndices.map((i) => this._rows[i]._id));
    //console.log(this.orderedSelectionIndicies, ids.toString(), diffAdded, diffRemoved);

    const selection: ISelection = {idtype: this.idType, range: uids};
    // Note: listener of that event calls LineUpSelectionHelper.setItemSelection()
    this.fire(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, selection);
  }

  set rows(rows: any[]) {
    this._rows = rows;
    this.buildCache();
  }

  get rows(): any[] {
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
    return rlist(ids);
  }

  setItemSelection(sel: ISelection) {
    if (!this.lineup) {
      return;
    }

    const indices: number[] = [];
    sel.range.dim(0).forEach((uid) => {
      const index = this.uid2index.get(uid);
      if (typeof index === 'number') {
        indices.push(index);
      }
    });

    this.removeEventListener();
    this.lineup.data.setSelection(indices);
    this.addEventListener();
  }

  destroy() {
    this.removeEventListener();
  }

}
