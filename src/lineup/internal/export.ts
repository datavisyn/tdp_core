import {IDataRow, Column, isNumberColumn, LocalDataProvider, isSupportType} from 'lineupjs';
import {lazyDialogModule} from '../../dialogs';
import {randomId} from 'phovea_core/src';

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

interface IExportData {
  type: ExportType;
  columns: Column[];
  order: number[];
  name: string;
}

function customizeDialog(provider: LocalDataProvider): Promise<IExportData> {
  return lazyDialogModule().then((dialogs) => {
    const dialog = new dialogs.FormDialog('Export Data &hellip;', '<i class="fa fa-download"></i> Export');

    const id = `e${randomId(3)}`;
    const ranking = provider.getFirstRanking();

    const flat = ranking.flatColumns;
    const lookup = new Map(flat.map((d) => <[string, Column]>[d.id, d]));

    dialog.form.innerHTML = `
      ${flat.map((col) => `
        <div class="checkbox">
        <label>
          <input type="checkbox" name="columns" value="${col.id}" ${!isSupportType(col) ? 'checked' : ''}>
          ${col.label}
        </label>
      </div>
      `).join('')}
      <div class="form-group">
        <label for="rows_${id}">Exported Rows</label>
        <select class="form-control" id="rows_${id}" name="rows" required>
          <option value="all" selected>All rows (${ranking.getOrder().length})</option>
          <option value="selected">Selected row only (${provider.getSelection().length})</option>
          <option value="not">Not selected rows only (${ranking.getOrder().length - provider.getSelection().length})</option>
        </select>
      </div>
      <div class="form-group">
        <label for="name_${id}">Export Name</label>
        <input class="form-control" id="name_${id}" name="name" value="Export" placeholder="name of the exported file">
      </div>
      <div class="form-group">
        <label for="type_${id}">Export Format</label>
        <select class="form-control" id="type_${id}" name="type" required placeholder="export format">
          <option value="csv" selected>CSV (comma separated)</option>
          <option value="tsv">TSV (tab separated)</option>
          <option value="ssv">CSV (semicolon separated)</option>
          <option value="json">JSON</option>
        </select>
      </div>
    `;

    return new Promise<IExportData>((resolve) => {
      dialog.onSubmit(() => {
        const data = new FormData(dialog.form);
        dialog.hide();

        const rows = data.get('rows').toString();
        let order: number[];
        switch(rows) {
          case 'selected':
            order = provider.getSelection();
            break;
          case 'not':
            const selected = new Set(provider.getSelection());
            order = ranking.getOrder().filter((d) => !selected.has(d));
            break;
          default:
            order = ranking.getOrder();
        }

        const columns: Column[] = data.getAll('columns').map((d) => lookup.get(d.toString()));

        resolve({
          type: <ExportType>data.get('type'),
          columns,
          order,
          name: <string>data.get('name')
        });
        return false;
      });
      dialog.show();
      setTimeout(() => {
        const first = <HTMLElement>dialog.form.querySelector('input, select, textarea');
        if (first) {
          first.focus();
        }
      }, 250); // till dialog is visible
    });
  });
}

