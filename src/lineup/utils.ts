/**
 * Created by sam on 13.02.2017.
 */
import {IScoreRow} from '../base/interfaces';
import {RestBaseUtils, IParams, IRow} from '../base/rest';
import {IDataRow} from 'lineupjs';
import {IFormMultiMap, IFormRow, FormMap} from '../form/elements/FormMap';
import {Ajax, IPluginDesc} from 'phovea_core';
import {IScoreLoader} from '../base/interfaces';
import {Ranking, LocalDataProvider} from 'lineupjs';
import {IRankingWrapper} from './IRankingWrapper';

/**
 * Interface for AScoreAccessorProxy
 */
export interface IAccessorFunc<T> {
  (row: IDataRow): T;
}

export class AScoreAccessorProxy<T> {
  /**
   * the accessor for the score column
   * @param row
   */
  readonly accessor: IAccessorFunc<T> = (row: IDataRow) => this.access(row.v);
  private readonly scores = new Map<string, T>();

  constructor(private readonly missingValue: T = null) {

  }

  clear() {
    this.scores.clear();
  }

  setRows(rows: IScoreRow<T>[]) {
    rows.forEach(({id, score}) => this.scores.set(String(id), score));
  }

  protected access(row: IRow) {
    const rowId = String(row.id);
    if (this.scores === null || !this.scores.has(rowId)) {
      return this.missingValue;
    }
    return this.scores.get(rowId);
  }
}

class NumberScoreAccessorProxy extends AScoreAccessorProxy<number> {
}


class CategoricalScoreAccessorProxy extends AScoreAccessorProxy<string> {

  protected access(row: IRow) {
    const v = super.access(row);
    return String(v); //even null values;
  }
}

export class LineupUtils {

  /**
   * Wraps the score such that the plugin is loaded and the score modal opened, when the factory function is called
   * @param score
   * @returns {IScoreLoader}
   */
  static wrap(score: IPluginDesc): IScoreLoader {
    return {
      text: score.name,
      id: score.id,
      scoreId: score.id,
      factory(extraArgs: object, count: number) {
        return score.load().then((p) => Promise.resolve(p.factory(score, extraArgs, count)));
      }
    };
  }
  /**
   * creates and accessor helper
   * @param colDesc
   * @returns {CategoricalScoreAccessorProxy|NumberScoreAccessorProxy}
   */
  static createAccessor(colDesc: any): AScoreAccessorProxy<any> {
    const accessor = colDesc.type === 'categorical' ? new CategoricalScoreAccessorProxy(colDesc.missingValue) : new NumberScoreAccessorProxy(colDesc.missingValue);
    colDesc.accessor = accessor.accessor;
    return accessor;
  }


  /**
   * converts the given filter object to request params
   * @param filter input filter
   */
  static toFilter(filter: IFormMultiMap | IFormRow[]): IParams {
    if (Array.isArray(filter)) {
      //map first
      return LineupUtils.toFilter(FormMap.convertRow2MultiMap(filter));
    }
    const clean = (v: any) => {
      if (Array.isArray(v)) {
        return v.map(clean);
      }
      if (typeof v === 'object' && v.id !== undefined && v.text !== undefined) {
        return v.id;
      }
      return v;
    };
    const param: IParams = {};
    Object.keys(filter).forEach((k) => {
      param[k] = clean(filter[k]);
    });
    return param;
  }

  static toFilterString(filter: IFormMultiMap, key2name?: Map<string, string>) {
    const keys = Object.keys(filter);
    if (keys.length === 0) {
      return '<None>';
    }
    const toString = (v: any) => {
      if (typeof v === 'object' && v.id !== undefined && v.text !== undefined) {
        return v.text;
      }
      return v.toString();
    };
    return keys.map((d) => {
      const v = filter[d];
      const label = key2name && key2name.has(d) ? key2name.get(d) : d;
      const vn = Array.isArray(v) ? '["' + v.map(toString).join('","') + '"]' : '"' + toString(v) + '"';
      return `${label}=${vn}`;
    }).join(' & ');
  }

  /**
   * generator for a FormMap compatible badgeProvider based on the given database url
   */
  static previewFilterHint(database: string, view: string, extraParams?: () => any): (rows: IFormRow[]) => Promise<string> {
    let total: Promise<number> = null;
    const cache = new Map<string, Promise<number>>();

    return (rows: IFormRow[]) => {
      if (total === null) { // compute all by no setting any filter
        total = RestBaseUtils.getTDPCount(database, view, (extraParams ? extraParams() : {}));
      }
      if (!rows) { //if no filter is set return all
        return total.then((count: number) => `${count} / ${count}`);
      }
      //compute filtered ones
      const filter = LineupUtils.toFilter(rows);
      const param: IParams = {};
      if (extraParams) {
        Object.assign(param, extraParams());
      }
      const key = `${Ajax.encodeParams(param)}@${Ajax.encodeParams(filter)}`;
      if (!cache.has(key)) {
        cache.set(key, RestBaseUtils.getTDPCount(database, view, param, filter));
      }
      return Promise.all([total, cache.get(key)]).then((results: number[]) => {
        return `${results[1]} / ${results[0]}`;
      }, () => {
        // ignore error and return dunno
        return `? / ?`;
      });
    };
  }

  /**
   * Returns the all items that are not in the given two arrays
   * TODO improve performance of diff algorithm
   * @param array1
   * @param array2
   * @returns {any}
   */
  static array_diff<T>(array1: T[], array2: T[]) {
    return array1.filter((elm) => array2.indexOf(elm) === -1);
  }

  /**
   * Returns all elements from set1 which are not in set2
   * @param set1
   * @param set2
   * @returns Set<T>
   */
  static set_diff<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const diff = new Set<T>();
    set1.forEach((elem) => {
      if (!set2.has(elem)) {
        diff.add(elem);
      }
    });
    return diff;
  }

  static wrapRanking(data: LocalDataProvider, ranking: Ranking) {
    const findColumn = (column: string) => ranking.find((d) => (<any>d.desc).column === column || d.desc.label === column);
    return <IRankingWrapper> {
      findColumn,
      sortBy: (column: string, asc = true) => {
        const col = findColumn(column);
        if (!col) {
          return false;
        }
        ranking.setSortCriteria({col, asc});
        return true;
      },
      groupBy: (column: string, aggregate = false) => {
        const col = findColumn(column);
        if (!col) {
          return false;
        }
        ranking.setGroupCriteria([col]);
        if (aggregate) {
          ranking.on(`${Ranking.EVENT_GROUPS_CHANGED}.aggregateswitch`, () => {
            data.aggregateAllOf(ranking, true);
            ranking.on(`${Ranking.EVENT_GROUPS_CHANGED}.aggregateswitch`, null);
          });
        }
        return true;
      }
    };
  }
}
