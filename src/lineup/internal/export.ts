import {IDataRow, Column, isNumberColumn, LocalDataProvider, isSupportType} from 'lineupjs';
import {lazyDialogModule} from '../../base/dialogs';
import {BaseUtils, I18nextManager} from 'phovea_core';
import {json2xlsx} from '../../utils/xlsx';

function isDateColumn(column: Column) {
  return column.desc.type === 'date';
}

function getColumnName(column: Column) {
  return column.label + (column.description ? '\n' + column.description : '');
}

export function exportRanking(columns: Column[], rows: IDataRow[], separator: string) {
  //optionally quote not numbers
  const escape = new RegExp(`["]`, 'g');

  function quote(v: any, c?: Column) {
    if (v == null) {
      return '';
    }
    const l = v.toString();
    if (l == null || l === 'null') {
      return '';
    }
    if ((l.includes('\n') || l.includes(separator)) && (!c || !isNumberColumn(c))) {
      return `"${l.replace(escape, '""')}"`;
    }
    return l;
  }

  const r: string[] = [];
  r.push(columns.map((d) => quote(getColumnName(d))).join(separator));
  rows.forEach((row) => {
    r.push(columns.map((c) => quote(c.getExportValue(row, 'text'), c)).join(separator));
  });
  return r.join('\n');
}

export function exportJSON(columns: Column[], rows: IDataRow[]) {
  const converted = rows.map((row) => {
    const r: any = {};
    for (const col of columns) {
      r[getColumnName(col)] = isNumberColumn(col) ? col.getRawNumber(row) : col.getExportValue(row, 'json');
    }
    return r;
  });
  return JSON.stringify(converted, null, 2);
}

export function exportxlsx(columns: Column[], rows: IDataRow[]) {
  const converted = rows.map((row) => {
    const r: any = {};
    for (const col of columns) {
      r[getColumnName(col)] = isNumberColumn(col) ? col.getRawNumber(row) : col.getValue(row);
    }
    return r;
  });
  return json2xlsx({
    sheets: [{
      title: 'LineUp',
      columns: columns.map((d) => ({name: getColumnName(d), type: <'float' | 'string' | 'date'>(isNumberColumn(d) ? 'float' : isDateColumn(d) ? 'date' : 'string')})),
      rows: converted
    }]
  });
}

export declare type ExportType = 'json' | 'csv' | 'tsv' | 'ssv' | 'xlsx';


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

function toBlob(content: string, mimeType: string) {
  return new Blob([content], {type: mimeType});
}

function convertRanking(provider: LocalDataProvider, order: number[], columns: Column[], type: ExportType, name: string) {
  const rows = provider.viewRawRows(order);

  const separators = {csv: ',', tsv: '\t', ssv: ';'};
  let content: Promise<Blob> | Blob;
  const mimeTypes = {csv: 'text/csv', tsv: 'text/tab-separated-values', ssv: 'text/csv', json: 'application/json', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
  const mimeType = mimeTypes[type];
  if (type in separators) {
    content = toBlob(exportRanking(columns, rows, separators[type]), mimeType);
  } else if (type === 'xlsx') {
    content = exportxlsx(columns, rows);
  } else { // json
    content = toBlob(exportJSON(columns, rows), mimeType);
  }
  return Promise.resolve(content).then((c) => ({
    content: c,
    mimeType: mimeTypes[type],
    name: `${name}.${type === 'ssv' ? 'csv' : type}`
  }));
}

interface IExportData {
  type: ExportType;
  columns: Column[];
  order: number[];
  name: string;
}

function customizeDialog(provider: LocalDataProvider): Promise<IExportData> {
  return lazyDialogModule().then((dialogs) => {
    const dialog = new dialogs.FormDialog(`${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportData')}`, `<i class="fa fa-download"></i>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.export')}`);

    const id = `e${BaseUtils.randomId(3)}`;
    const ranking = provider.getFirstRanking();
    dialog.form.classList.add('tdp-ranking-export-form');

    const flat = ranking.flatColumns;
    const lookup = new Map(flat.map((d) => <[string, Column]>[d.id, d]));

    dialog.form.innerHTML = `
      <div class="form-group">
        <label>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.columns')}</label>
        ${flat.map((col) => `
          <div class="checkbox tdp-ranking-export-form-handle">
          <span class="fa fa-sort"></span>
          <label>
            <input type="checkbox" name="columns" value="${col.id}" ${!isSupportType(col) ? 'checked' : ''}>
            ${col.label}
          </label>
        </div>
        `).join('')}
      </div>
      <div class="form-group">
        <label>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.rows')}</label>
        <div class="radio"><label><input type="radio" name="rows" value="all" checked>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.allRows')} (${ranking.getOrder().length})</label></div>
        <div class="radio"><label><input type="radio" name="rows" value="selected">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.selectedRows')} (${provider.getSelection().length})</label></div>
        <div class="radio"><label><input type="radio" name="rows" value="not">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.notSelectedRows')} (${ranking.getOrder().length - provider.getSelection().length})</label></div>
      </div>
      <div class="form-group">
        <label for="name_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportName')}</label>
        <input class="form-control" id="name_${id}" name="name" value="Export" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.nameOfExported')}">
      </div>
      <div class="form-group">
        <label for="type_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportFormatCapital')}</label>
        <select class="form-control" id="type_${id}" name="type" required placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportFormat')}">
        <option value="csv" selected>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.csvComma')}</option>
        <option value="tsv">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.tsv')}</option>
        <option value="ssv">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.csvColon')}</option>
        <option value="json">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.json')}</option>
        <option value="xlsx">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.excel')}</option>
        </select>
      </div>
    `;

    resortAble(<HTMLElement>dialog.form.firstElementChild!, '.checkbox');


    return new Promise<IExportData>((resolve) => {
      dialog.onSubmit(() => {
        const data = new FormData(dialog.form);
        dialog.hide();

        const rows = data.get('rows').toString();
        let order: number[];
        switch (rows) {
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

export function resortAble(base: HTMLElement, elementSelector: string) {
  const items = <HTMLElement[]>Array.from(base.querySelectorAll(elementSelector));

  const enable = (item: HTMLElement) => {
    item.classList.add('dragging');
    base.classList.add('dragging');
    let prevBB: DOMRect | ClientRect;
    let nextBB: DOMRect | ClientRect;

    const update = () => {
      prevBB = item.previousElementSibling && item.previousElementSibling.matches(elementSelector) ? item.previousElementSibling.getBoundingClientRect() : null;
      nextBB = item.nextElementSibling && item.nextElementSibling.matches(elementSelector) ? item.nextElementSibling.getBoundingClientRect() : null;
    };
    update();

    base.onmouseup = base.onmouseleave = () => {
      item.classList.remove('dragging');
      base.classList.remove('dragging');
      base.onmouseleave = base.onmouseup = base.onmousemove = null;
    };
    base.onmousemove = (evt) => {
      const y = evt.clientY;
      if (prevBB && y < (prevBB.top + prevBB.height / 2)) {
        // move up
        item.parentElement!.insertBefore(item, item.previousElementSibling);
        update();
      } else if (nextBB && y > (nextBB.top + nextBB.height / 2)) {
        // move down
        item.parentElement!.insertBefore(item.nextElementSibling, item);
        update();
      }
      evt.preventDefault();
      evt.stopPropagation();
    };
  };

  for (const item of items) {
    const handle = <HTMLElement>item.firstElementChild!;
    handle.onmousedown = () => {
      enable(item);
    };
  }
}
