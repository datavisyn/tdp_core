import {debounce} from 'phovea_core/src';
import {parse} from 'phovea_core/src/range';
import {showErrorModalDialog} from '../dialogs';
import {IRow} from '../rest';
import {ISelection, IViewContext} from '../views';
import {AView} from './AView';

export interface IATableViewOptions {
  selectAble: boolean;
  stripedRows: boolean;
  bordered: boolean;
  condensed: boolean;
  sortable: boolean | ((th: HTMLElement, index: number) => boolean | 'number' | 'string');
  exportable?: boolean;
  exportSeparator?: string;
}

/**
 * base class for views based on LineUp
 */
export abstract class ATableView<T extends IRow> extends AView {

  private readonly options: Readonly<IATableViewOptions> = {
    selectAble: true,
    stripedRows: false,
    bordered: false,
    condensed: false,
    sortable: true,
    exportable: false,
    exportSeparator: ';'
  };

  /**
   * clears and rebuilds this lineup instance from scratch
   * @returns {Promise<any[]>} promise when done
   */
  protected rebuild = debounce(() => this.rebuildImpl(), 100);

  /**
   * similar to rebuild but just loads new data and keep the columns
   * @returns {Promise<any[]>} promise when done
   */
  protected reloadData = debounce(() => this.reloadDataImpl(), 100);

  /**
   * promise resolved when everything is built
   * @type {any}
   */
  protected built: Promise<any> = null;

  constructor(context: IViewContext, selection: ISelection, parent: HTMLElement, options: Partial<IATableViewOptions> = {}) {
    super(context, selection, parent);
    Object.assign(this.options, options);

    this.node.classList.add('tdp-table');
  }

  /**
   * custom initialization function at the build will be called
   */
  protected initImpl() {
    super.initImpl();

    this.node.innerHTML = `<table class="table table-hover ${this.options.condensed ? ' table-condensed' : ''}${this.options.bordered ? ' table-bordered' : ''}${this.options.stripedRows ? ' table-striped' : ''}">
        <thead><tr></tr></thead>
        <tbody></tbody>
    </table>`;

    return this.built = this.build();
  }

  protected renderHeader(tr: HTMLTableRowElement, rows: T[]) {
    if (rows.length === 0) {
      return [];
    }
    const keys = <(keyof T)[]>Object.keys(rows[0]).filter((d) => d !== 'id' && d !== '_id').sort();
    tr.innerHTML = keys.map((key) => `<th>${key}</th>`).join('');
    return keys;
  };

  protected renderRow(tr: HTMLTableRowElement, row: T, index: number, keys: (keyof T)[]) {
    tr.dataset.id = row._id.toString();
    tr.innerHTML = keys.map((key) => `<td>${row[key]}</td>`).join('');
  };

  /**
   * load the rows of LineUp
   * @returns {Promise<IRow[]>} the rows at least containing the represented ids
   */
  protected abstract loadRows(): Promise<T[]> | T[];

  protected buildHook() {
    // hook
  }

  private build() {
    this.setBusy(true);
    this.buildHook();
    return Promise.resolve(this.loadRows()).then((rows) => {
      this.renderTable(rows);
      if (this.options.exportable) {
        this.enableExport();
      }
      this.setBusy(false);
    }).catch(showErrorModalDialog)
      .catch((error) => {
        console.error(error);
        this.setBusy(false);
      });
  }


  protected renderHook(rows: T[]) {
    // hook
  }

  private renderTable(rows: T[]) {
    this.renderHook(rows);
    const header = <HTMLTableRowElement>this.node.querySelector('thead tr');
    header.innerHTML = '';
    const keys = this.renderHeader(header, rows);
    const body = <HTMLTableSectionElement>this.node.querySelector('tbody');
    if (this.options.sortable) {
      enableSort(header, body, this.options.sortable);
    }
    body.innerHTML = '';
    rows.forEach((row, i) => {
      const tr = body.insertRow();
      tr.dataset.i = String(i);
      this.renderRow(tr, row, i, keys);
      if (this.options.selectAble && this.itemIDType) {
        tr.onclick = (evt) => {
          evt.preventDefault();
          evt.stopPropagation();
          this.setItemSelection({
            idtype: this.itemIDType,
            range: parse([row._id])
          });
        };
      }
    });
  }

  private reloadDataImpl() {
    return this.built = Promise.all([this.built, this.loadRows()]).then((r) => {
      this.renderTable(r[1]);
    });
  }

  private rebuildImpl() {
    return this.built = this.built.then(() => this.build());
  }

  /**
   * Add icon to export HTML Table content to the most right column in the table header.
   */
  private enableExport() {
    const rightTableHeader = this.node.querySelector('thead > tr').lastElementChild;
    (<HTMLElement>rightTableHeader).dataset.export = 'enabled';
    rightTableHeader.insertAdjacentHTML('beforeend',
      `<a href="#" title="Download Table as CSV"><i class="fa fa-download"></i></a>`);
    (<HTMLElement>rightTableHeader.querySelector('a'))!.onclick = (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      exportHtmlTableContent(this.node.ownerDocument, (<HTMLElement>this.node.querySelector('table')), this.options.exportSeparator, this.context.desc.name);
    };
  }
}

export function enableSort(this: void, header: HTMLElement, body: HTMLElement, sortable: boolean | ((th: HTMLElement, index: number) => boolean | 'number' | 'string')) {
  const text = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase());
  const number = (a: string, b: string) => {
    const av = parseFloat(a);
    const bv = parseFloat(b);
    if (isNaN(av) && isNaN(bv)) {
      return text(a, b);
    }
    if (isNaN(av)) {
      return -1;
    }
    if (isNaN(bv)) {
      return +1;
    }
    return av - bv;
  };

  const sorter = (th: HTMLElement, i: number) => {
    return () => {
      const current = th.dataset.sort;
      const rows = <HTMLElement[]>Array.from(body.children);
      const next = current === 'no' ? 'asc' : (current === 'asc' ? 'desc' : 'no');
      th.dataset.sort = next;
      const sorter = th.dataset.num != null ? number : text;
      switch (next) {
        case 'no':
          // natural order
          rows.sort((a, b) => parseInt(a.dataset.i, 10) - parseInt(b.dataset.i, 10));
          break;
        case 'desc':
          rows.sort((a, b) => {
            const acol = a.children[i];
            const bcol = b.children[i];
            return -sorter(acol ? acol.textContent : '', bcol ? bcol.textContent : '');
          });
          break;
        default:
          rows.sort((a, b) => {
            const acol = a.children[i];
            const bcol = b.children[i];
            return sorter(acol ? acol.textContent : '', bcol ? bcol.textContent : '');
          });
      }
      // readd in ordered sequence
      body.innerHTML = '';
      rows.forEach((r) => body.appendChild(r));
    };
  };


  Array.from(header.children).forEach((d: HTMLElement, i) => {
    const sort = typeof sortable === 'function' ? sortable(d, i) : sortable;
    if (!sort) {
      return;
    }
    d.dataset.sort = 'no';
    if (sort === 'number') {
      d.dataset.num = '';
    }
    d.onclick = sorter(d, i);
  });
}

/**
 * Download the HTML Table content.
 */
function exportHtmlTableContent(document: Document, tableRoot: HTMLElement, separator: string, name: string) {
  const content = parseHtmlTableContent(tableRoot, separator);
  const downloadLink = document.createElement('a');
  const blob = new Blob([content], {type: 'text/csv;charset=utf-8'});
  downloadLink.href = URL.createObjectURL(blob);
  (<any>downloadLink).download = `${name}.csv`;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

/**
 * Parse HTML Table header and body content.
 * @returns {string} The table content in csv format
 */
function parseHtmlTableContent(tableRoot: HTMLElement, separator: string) {
  const headerContent = Array.from(tableRoot.querySelectorAll('thead > tr > th'))
    .map((d) => (<HTMLTableHeaderCellElement>d).innerText).join(separator);
  const bodyRows = Array.from(tableRoot.querySelectorAll('tbody > tr'));
  const bodyContent = bodyRows.map((row: HTMLTableRowElement) => {
    return Array.from(row.children)
      .map((d) => (<HTMLTableDataCellElement>d).innerText).join(separator);
  }).join('\n');
  const content = `${headerContent}\n${bodyContent}`;
  return content;
}

export default ATableView;
