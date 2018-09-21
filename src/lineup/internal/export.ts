import {IDataRow, Column, isNumberColumn, LocalDataProvider, isSupportType} from 'lineupjs';

export function exportRanking(columns: Column[], rows: IDataRow[], separator: string) {
  //optionally quote not numbers
  const escape = new RegExp(`["]`, 'g');

  function quote(l: string, c?: Column) {
    if (l == null || l === 'null') {
      return '';
    }
    if ((l.indexOf('\n') >= 0) && (!c || !isNumberColumn(c))) {
      return `"${l.replace(escape, '""')}"`;
    }
    return l;
  }

  const r: string[] = [];
  r.push(columns.map((d) => quote(`${d.label}${d.description ? `\n${d.description}` : ''}`)).join(separator));
  rows.forEach((row) => {
    r.push(columns.map((c) => quote(c.getLabel(row), c)).join(separator));
  });
  return r.join('\n');
}

export function exportJSON(columns: Column[], rows: IDataRow[]) {
  const converted = rows.map((row) => {
    const r: any = {};
    for (const col of columns) {
      r[col.label] = isNumberColumn(col) ? col.getRawNumber(row) : col.getValue(row);
    }
    return r;
  });
  return JSON.stringify(converted, null, 2);
}

export declare type ExportType = 'json' | 'csv' | 'tsv' | 'ssv';

export function customizeDialog(provider: LocalDataProvider): Promise<{type: ExportType, columns: Column[], order: number[], name: string}> {
  return null;
}

export function exportLogic(type: 'custom' | ExportType, onlySelected: boolean, provider: LocalDataProvider) {
  if (type === 'custom') {
    return customizeDialog(provider).then((r) => convertRanking(provider, r.order, r.columns, r.type, r.name));
  } else {
    const ranking = provider.getFirstRanking();
    const order = onlySelected ? provider.getSelection() : ranking!.getOrder();
    const columns = ranking.flatColumns.filter((c) => !isSupportType(c));
    return Promise.resolve(convertRanking(provider, order, columns, type, ranking.getLabel()));
  }
}

function convertRanking(provider: LocalDataProvider, order: number[], columns: Column[], type: ExportType, name: string) {
  const rows = provider.viewRawRows(order);

  const separators = {csv : ',', tsv: '\t', ssv: ';'};
  let content: string;
  if (type in separators) {
    content = exportRanking(columns, rows, separators[type]);
  } else { // json
    content = exportJSON(columns, rows);
  }
  const mimeTypes = {csv : 'text/csv', tsv: 'text/text/tab-separated-values', ssv: 'text/csv', json: 'application/json'};
  return {
    content,
    mimeType: mimeTypes[type],
    name: `${name}.${type === 'ssv' ? 'csv' : type}`
  };
}
