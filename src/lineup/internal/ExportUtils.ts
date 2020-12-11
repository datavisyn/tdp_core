import {IDataRow, Column, isNumberColumn, LocalDataProvider, isSupportType, isDateColumn, UIntTypedArray} from 'lineupjs';
import {BaseUtils, I18nextManager} from 'phovea_core';
import {XlsxUtils} from '../../utils/XlsxUtils';

export declare type ExportFormat = 'json' | 'csv' | 'tsv' | 'ssv' | 'xlsx';
export declare type ExportRows = 'all' | 'filtered' | 'selected';

/**
 * Store the ordered row indices
 */
export interface IOrderedRowIndices {
  /**
   * All row indices from the data provider.
   * Indices are not sorting (= sorting of input data)!
   */
  all: number[];

  /**
   * Indices of the selected rows.
   * Indices are sorted by the *first* ranking.
   */
  selected: number[];

  /**
   * Indices of the filtered rows.
   * Indices are sorted and filtered by the *first* ranking.
   */
  filtered: number[];
}

interface IExportData {
  type: ExportFormat;
  columns: Column[];
  order: number[];
  name: string;
}

export class ExportUtils {

  private static getColumnName(column: Column) {
    return column.label + (column.desc.summary ? ' - ' + column.desc.summary : '') + (column.description ? '\n' + column.description : '');
  }

  static exportRanking(columns: Column[], rows: IDataRow[], separator: string) {
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
    r.push(columns.map((d) => quote(ExportUtils.getColumnName(d))).join(separator));
    rows.forEach((row) => {
      r.push(columns.map((c) => quote(c.getExportValue(row, 'text'), c)).join(separator));
    });
    return r.join('\n');
  }

  static exportJSON(columns: Column[], rows: IDataRow[]) {
    const converted = rows.map((row) => {
      const r: any = {};
      for (const col of columns) {
        r[ExportUtils.getColumnName(col)] = isNumberColumn(col) ? col.getRawNumber(row) : col.getExportValue(row, 'json');
      }
      return r;
    });
    return JSON.stringify(converted, null, 2);
  }

  static exportxlsx(columns: Column[], rows: IDataRow[]) {
    const converted = rows.map((row) => {
      const r: any = {};
      for (const col of columns) {
        r[ExportUtils.getColumnName(col)] = isNumberColumn(col) ? col.getRawNumber(row) : col.getExportValue(row, 'text');
      }
      return r;
    });
    return XlsxUtils.json2xlsx({
      sheets: [{
        title: 'LineUp',
        columns: columns.map((d) => ({name: ExportUtils.getColumnName(d), type: <'float' | 'string' | 'date'>(isNumberColumn(d) ? 'float' : isDateColumn(d) ? 'date' : 'string')})),
        rows: converted
      }]
    });
  }

  static exportLogic(format: 'custom' | ExportFormat, rows: 'custom' | ExportRows, orderedRowIndices: IOrderedRowIndices, provider: LocalDataProvider) {
    if (format === 'custom') {
      return ExportUtils.customizeDialog(orderedRowIndices, provider).then((r) => ExportUtils.convertRanking(provider, r.order, r.columns, r.type, r.name));

    } else {
      const ranking = provider.getFirstRanking();
      let order: number[];

      switch(rows) {
        case 'selected':
          order = orderedRowIndices.selected;
          break;
        case 'filtered':
          order = orderedRowIndices.filtered;
          break;
        default:
          order = orderedRowIndices.all;
      }

      const columns = ranking.flatColumns.filter((c) => !isSupportType(c));
      return Promise.resolve(ExportUtils.convertRanking(provider, order, columns, format, ranking.getLabel()));
    }
  }

  private static toBlob(content: string, mimeType: string) {
    return new Blob([content], {type: mimeType});
  }

  private static convertRanking(provider: LocalDataProvider, order: number[], columns: Column[], type: ExportFormat, name: string) {
    const rows = provider.viewRawRows(order);
    const separators = {csv: ',', tsv: '\t', ssv: ';'};
    let content: Promise<Blob> | Blob;
    const mimeTypes = {csv: 'text/csv', tsv: 'text/tab-separated-values', ssv: 'text/csv', json: 'application/json', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
    const mimeType = mimeTypes[type];
    if (type in separators) {
      content = ExportUtils.toBlob(ExportUtils.exportRanking(columns, rows, separators[type]), mimeType);
    } else if (type === 'xlsx') {
      content = ExportUtils.exportxlsx(columns, rows);
    } else { // json
      content = ExportUtils.toBlob(ExportUtils.exportJSON(columns, rows), mimeType);
    }
    return Promise.resolve(content).then((c) => ({
      content: c,
      mimeType: mimeTypes[type],
      name: `${name}.${type === 'ssv' ? 'csv' : type}`
    }));
  }

  private static customizeDialog(orderedRowIndices:IOrderedRowIndices, provider: LocalDataProvider): Promise<IExportData> {
    return import('phovea_ui/dist/components/dialogs').then((dialogs) => {
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
          <div class="radio"><label><input type="radio" name="rows" value="all" checked>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.allRows')} (${orderedRowIndices.all.length})</label></div>
          <div class="radio"><label><input type="radio" name="rows" value="filtered">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.filteredRows')} (${orderedRowIndices.filtered.length})</label></div>
          <div class="radio"><label><input type="radio" name="rows" value="selected">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.selectedRows')} (${orderedRowIndices.selected.length})</label></div>
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

      ExportUtils.resortAble(<HTMLElement>dialog.form.firstElementChild!, '.checkbox');

      return new Promise<IExportData>((resolve) => {
        dialog.onSubmit(() => {
          const data = new FormData(dialog.form);

          dialog.hide();

          const rows = data.get('rows').toString();
          let order: number[];

          switch(rows) {
            case 'selected':
              order = orderedRowIndices.selected;
              break;
            case 'filtered':
              order = orderedRowIndices.filtered;
              break;
            default:
              order = orderedRowIndices.all;
          }

          const columns: Column[] = data.getAll('columns').map((d) => lookup.get(d.toString()));

          resolve({
            type: <ExportFormat>data.get('type'),
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

  static resortAble(base: HTMLElement, elementSelector: string) {
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
}
