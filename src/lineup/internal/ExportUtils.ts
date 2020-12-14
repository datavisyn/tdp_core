import {IDataRow, Column, isNumberColumn, isDateColumn} from 'lineupjs';
import {XlsxUtils} from '../../utils/XlsxUtils';

export declare type ExportFormat = 'json' | 'csv' | 'tsv' | 'ssv' | 'xlsx';

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

  static exportXLSX(columns: Column[], rows: IDataRow[]) {
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
