/**
 * Created by sam on 13.02.2017.
 */
import {IColumnDesc, createSelectionDesc} from 'lineupjs/src/model';
import LineUp from 'lineupjs/src/lineup';
import {extent} from 'd3';
import {IAnyVector} from 'phovea_core/src/vector';
import {VALUE_TYPE_STRING, VALUE_TYPE_CATEGORICAL, VALUE_TYPE_REAL, VALUE_TYPE_INT} from 'phovea_core/src/datatype';

export interface IAdditionalColumnDesc extends IColumnDesc {
  selectedId: number;
  selectedSubtype?: string;
}

function baseColumn(column: string, label = column, visible = true, width = -1, selectedId = -1, selectedSubtype?: string) {
  return {
    type: 'string',
    column,
    label,
    color: '',
    visible,
    width,
    selectedId,
    selectedSubtype
  };
}

export function numberColFromArray(column: string, rows: any[], label = column, visible = true, width = -1, selectedId = -1, selectedSubtype?: string) {
  return Object.assign(baseColumn(column, label, visible, width, selectedId, selectedSubtype), {
    type: 'number',
    domain: extent(rows, (d) => d[column])
  });
}

export function numberCol(column: string, min: number, max: number, label = column, visible = true, width = -1, selectedId = -1, selectedSubtype?: string) {
  return Object.assign(baseColumn(column, label, visible, width, selectedId, selectedSubtype), {
    type: 'number',
    domain: [min, max],
  });
}

export function categoricalCol(column: string, categories: (string|{label?: string, name: string, color?: string})[], label = column, visible = true, width = -1, selectedId = -1, selectedSubtype?: string) {
  return Object.assign(baseColumn(column, label, visible, width, selectedId, selectedSubtype), {
    type: 'categorical',
    categories
  });
}

export function stringCol(column: string, label = column, visible = true, width = -1, selectedId = -1, selectedSubtype?: string) {
  return Object.assign(baseColumn(column, label, visible, width, selectedId, selectedSubtype), {});
}

export function booleanCol(column: string, label = column, visible = true, width = -1, selectedId = -1, selectedSubtype?: string) {
  return Object.assign(baseColumn(column, label, visible, width, selectedId, selectedSubtype), {
    type: 'boolean'
  });
}

export function deriveCol(col: IAnyVector): IColumnDesc {
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
    case VALUE_TYPE_STRING:
      r.type = 'string';
      break;
    case VALUE_TYPE_CATEGORICAL:
      r.type = 'categorical';
      r.categories = desc.categories;
      break;
    case VALUE_TYPE_REAL:
    case VALUE_TYPE_INT:
      r.type = 'number';
      r.domain = val.range;
      break;
    default:
      r.type = 'string';
      break;
  }
  return r;
}

export function createInitialRanking(lineup: LineUp) {
  const provider = lineup.data;
  const ranking = provider.pushRanking();
  ranking.push(provider.create(createSelectionDesc()));

  lineup.data.getColumns().filter((d) => (<any>d).visible !== false).forEach((d) => {
    const col = this.provider.create(d);
    // set initial column width
    if (typeof (<any>d).width === 'number' && (<any>d).width > -1) {
      col.setWidth((<any>d).width);
    }
    ranking.push(col);
  });
}
