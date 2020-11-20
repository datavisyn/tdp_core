/**
 * Created by sam on 13.02.2017.
 */

import {LocalDataProvider, createSelectionDesc, createAggregateDesc, DEFAULT_COLOR, IColumnDesc, ICategory, ICategoryNode, Column, createRankDesc} from 'lineupjs';
import {extent} from 'd3';
import {IAnyVector, ValueTypeUtils} from 'phovea_core';
import {IServerColumn} from '../base/rest';
import {IAdditionalColumnDesc} from '../base/interfaces';

export interface IColumnOptions extends Pick<IAdditionalColumnDesc, 'selectedId' | 'selectedSubtype' | 'initialRanking' | 'chooserGroup'> {
  /**
   * visible by default
   * @default true
   * @deprecated use initialRanking
   */
  visible?: boolean;
  /**
   * custom label instead of the column name
   * @default column
   */
  label: string;
  /**
   * specify an initial width
   * @default -1 = none
   */
  width: number;
  /**
   * extra arguments
   */
  extras?: {[key: string]: any};
}

export interface IInitialRankingOptions {
  aggregate: boolean;
  selection: boolean;
  rank: boolean;
  order: string[];
}

export class ColumnDescUtils {

  private static baseColumn(column: string, options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign({
      type: 'string',
      column,
      label: column,
      color: '',
      initialRanking: options.visible != null ? options.visible: true,
      width: -1,
      selectedId: -1,
      selectedSubtype: undefined
    }, options, options.extras || {});
  }

  static numberColFromArray(column: string, rows: any[], options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign(ColumnDescUtils.baseColumn(column, options), {
      type: 'number',
      domain: extent(rows, (d) => d[column])
    });
  }

  /**
   * creates a new LineUp description for a numerical column
   * @param {string} column the column name to use
   * @param {number} min the input minimal value
   * @param {number} max the input maximal value
   * @param {Partial<IColumnOptions>} options
   * @returns {IAdditionalColumnDesc}
   */
  static numberCol(column: string, min: number, max: number, options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign(ColumnDescUtils.baseColumn(column, options), {
      type: 'number',
      domain: [min, max]
    });
  }


  /**
   * creates a new LineUp description for a categorical column
   * @param {string} column the column name to use
   * @param {(string | Partial<ICategory>)[]} categories description of the categories
   * @param {Partial<IColumnOptions>} options
   * @returns {IAdditionalColumnDesc}
   */
  static categoricalCol(column: string, categories: (string|Partial<ICategory>)[], options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    if (ColumnDescUtils.isHierarchical(categories)) {
      return ColumnDescUtils.hierarchicalCol(column, ColumnDescUtils.deriveHierarchy(<any[]>categories), options);
    }
    return Object.assign(ColumnDescUtils.baseColumn(column, options), {
      type: 'categorical',
      categories
    });
  }

  static hierarchicalCol(column: string, hierarchy: ICategoryNode, options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign(ColumnDescUtils.baseColumn(column, options), {
      type: 'hierarchy',
      hierarchy
    });
  }
  /**
   * creates a new LineUp description for a string column
   * @param {string} column the column name to use
   * @param {Partial<IColumnOptions>} options
   * @returns {IAdditionalColumnDesc}
   */
  static stringCol(column: string, options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign(ColumnDescUtils.baseColumn(column, options), {});
  }

  /**
   * creates a new LineUp description for a link column
   * @param {string} column the column name to use
   * @param {string} linkPattern the pattern to resolve links from values, $1 will be replaced by the current value, $2 with the URL encoded version of it
   * @param {Partial<IColumnOptions>} options
   * @returns {IAdditionalColumnDesc}
   */
  static linkCol(column: string, linkPattern: string, options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign(ColumnDescUtils.stringCol(column, options), {
      type: 'link',
      pattern: linkPattern
    });
  }


  /**
   * creates a new LineUp description for a boolean column
   * @param {string} column the column name to use
   * @param {Partial<IColumnOptions>} options
   * @returns {IAdditionalColumnDesc}
   */
  static booleanCol(column: string, options: Partial<IColumnOptions> = {}): IAdditionalColumnDesc {
    return Object.assign(ColumnDescUtils.baseColumn(column, options), {
      type: 'boolean'
    });
  }

  static deriveCol(col: IAnyVector): IColumnDesc {
    const r: any = {
      column: col.desc.name
    };
    const desc = <any>col.desc;
    if (desc.color) {
      r.color = desc.color;
    } else if (desc.cssClass) {
      r.cssClass = desc.cssClass;
    }
    const val = desc.value;
    switch (val.type) {
      case ValueTypeUtils.VALUE_TYPE_STRING:
        r.type = 'string';
        break;
      case ValueTypeUtils.VALUE_TYPE_CATEGORICAL:
        r.type = 'categorical';
        r.categories = desc.categories;
        break;
      case ValueTypeUtils.VALUE_TYPE_REAL:
      case ValueTypeUtils.VALUE_TYPE_INT:
        r.type = 'number';
        r.domain = val.range;
        break;
      default:
        r.type = 'string';
        break;
    }
    return r;
  }



  static createInitialRanking(provider: LocalDataProvider, options: Partial<IInitialRankingOptions> = {}) {
    const o: Readonly<IInitialRankingOptions> = Object.assign({
      aggregate: true,
      selection: true,
      rank: true,
      order: []
    }, options);

    const ranking = provider.pushRanking();
    const r = ranking.find((d) => d.desc.type === 'rank');
    if (o.rank) {
      if (!r) {
        ranking.insert(provider.create(createRankDesc()), 0);
      }
    } else if (r) {
      r.removeMe();
    }

    if (o.aggregate) {
      ranking.insert(provider.create(createAggregateDesc()), 0);
    }
    if (o.selection) {
      ranking.push(provider.create(createSelectionDesc()));
    }

    const resolve = () => {
      const all = provider.getColumns();
      const cols: IColumnDesc[] = [];
      o.order.forEach((c) => {
        const col = all.find((d) => (<any>d).column === c || d.label === c);
        if (col) {
          cols.push(col);
        }
      });
      return cols;
    };

    const visibles: IColumnDesc[] = provider.getColumns().filter((d: any) => (<IAdditionalColumnDesc>d).initialRanking);
    const descs = o.order.length > 0 ? resolve() : visibles;

    descs.forEach((d) => {
      const col = provider.create(d);
      ranking.push(col);
    });
  }

  static deriveColumns(columns: IServerColumn[]) {
    const niceName = (label: string) => label.split('_').map((l) => l[0].toUpperCase() + l.slice(1)).join(' ');
    return columns.map((col) => {
      switch (col.type) {
        case 'categorical':
          return ColumnDescUtils.categoricalCol(col.column, col.categories, {label: niceName(col.label)});
        case 'number':
          return ColumnDescUtils.numberCol(col.column, col.min, col.max, {label: niceName(col.label)});
        default:
          return ColumnDescUtils.stringCol(col.column, {label: niceName(col.label)});
      }
    });
  }


  private static isHierarchical(categories: (string | Partial<ICategory>)[]) {
    if (categories.length === 0 || typeof categories[0] === 'string') {
      return false;
    }
    // check if any has a given parent name
    return categories.some((c) => (<any>c).parent != null);
  }

  private static deriveHierarchy(categories: (Partial<ICategory> & { parent: string | null })[]) {
    const lookup = new Map<string, ICategoryNode>();
    categories.forEach((c) => {
      const p = c.parent || '';
      // set and fill up proxy
      const item = Object.assign(<ICategoryNode>{
        children: [],
        label: c.name!,
        name: c.name!,
        color: DEFAULT_COLOR,
        value: 0
      }, lookup.get(c.name!) || {}, c);
      lookup.set(c.name!, item);

      if (!lookup.has(p)) {
        // create proxy
        lookup.set(p, {name: p, children: [], label: p, value: 0, color: DEFAULT_COLOR});
      }
      lookup.get(p)!.children.push(item);
    });
    const root = lookup.get('')!;
    console.assert(root !== undefined, 'hierarchy with no root');
    if (root.children.length === 1) {
      return root.children[0];
    }
    return root;
  }
}
