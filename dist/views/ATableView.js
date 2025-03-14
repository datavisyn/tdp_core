import { I18nextManager } from 'visyn_core/i18n';
import { XlsxUtils } from 'visyn_core/utils';
import { BaseUtils } from '../base';
import { AView } from './AView';
import { ErrorAlertHandler } from '../base/ErrorAlertHandler';
/**
 * base class for views based on LineUp
 */
export class ATableView extends AView {
    constructor(context, selection, parent, options = {}) {
        super(context, selection, parent);
        this.options = {
            selectAble: true,
            stripedRows: false,
            bordered: false,
            condensed: false,
            sortable: true,
            exportable: false,
            exportSeparator: ',',
        };
        /**
         * clears and rebuilds this lineup instance from scratch
         * @returns {Promise<any[]>} promise when done
         */
        this.rebuild = BaseUtils.debounce(() => this.rebuildImpl(), 100);
        /**
         * similar to rebuild but just loads new data and keep the columns
         * @returns {Promise<any[]>} promise when done
         */
        this.reloadData = BaseUtils.debounce(() => this.reloadDataImpl(), 100);
        /**
         * promise resolved when everything is built
         * @type {any}
         */
        this.built = null;
        Object.assign(this.options, options);
        this.node.classList.add('tdp-table');
    }
    /**
     * custom initialization function at the build will be called
     */
    initImpl() {
        super.initImpl();
        this.node.innerHTML = `<table class="table table-hover ${this.options.condensed ? ' table-sm' : ''}${this.options.bordered ? ' table-bordered' : ''}${this.options.stripedRows ? ' table-striped' : ''}">
        <thead><tr></tr></thead>
        <tbody></tbody>
    </table>`;
        return (this.built = this.build());
    }
    renderHeader(tr, rows) {
        if (rows.length === 0) {
            return [];
        }
        const keys = Object.keys(rows[0])
            .filter((d) => d !== 'id' && d !== '_id')
            .sort();
        tr.innerHTML = keys.map((key) => `<th>${String(key)}</th>`).join('');
        return keys;
    }
    renderRow(tr, row, index, keys) {
        tr.dataset.id = row.id;
        tr.innerHTML = keys.map((key) => `<td>${row[key]}</td>`).join('');
    }
    buildHook() {
        // hook
    }
    build() {
        this.setBusy(true);
        this.buildHook();
        return Promise.resolve(this.loadRows())
            .then((rows) => {
            this.renderTable(rows);
            this.setBusy(false);
        })
            .catch(ErrorAlertHandler.getInstance().errorAlert)
            .catch((error) => {
            console.error(error);
            this.setBusy(false);
        });
    }
    renderHook(rows) {
        // hook
    }
    renderTable(rows) {
        this.renderHook(rows);
        const header = this.node.querySelector('thead tr');
        header.innerHTML = '';
        const keys = this.renderHeader(header, rows);
        const body = this.node.querySelector('tbody');
        if (this.options.sortable) {
            ATableView.enableSort(header, body, this.options.sortable);
        }
        if (this.options.exportable) {
            this.enableExport();
        }
        body.innerHTML = '';
        rows.forEach((row, i) => {
            const tr = body.insertRow();
            tr.__data__ = row;
            tr.dataset.i = String(i);
            this.renderRow(tr, row, i, keys);
            if (this.options.selectAble && this.itemIDType) {
                tr.onclick = (evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                    this.setItemSelection({
                        idtype: this.itemIDType,
                        ids: [row.id],
                    });
                };
            }
        });
    }
    reloadDataImpl() {
        return (this.built = Promise.all([this.built, this.loadRows()]).then((r) => {
            this.renderTable(r[1]);
        }));
    }
    rebuildImpl() {
        return (this.built = this.built.then(() => this.build()));
    }
    /**
     * Add icon to export HTML Table content to the most right column in the table header.
     */
    enableExport() {
        const rightTableHeader = this.node.querySelector('thead > tr').lastElementChild;
        rightTableHeader.dataset.export = 'enabled';
        rightTableHeader.insertAdjacentHTML('beforeend', `<a href="#" title="${I18nextManager.getInstance().i18n.t('tdp:core.views.tableDownloadButton')}"><i class="fas fa-download"></i></a>`);
        rightTableHeader.querySelector('a').onclick = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            ATableView.exportHtmlTableContent(this.node.ownerDocument, this.node.querySelector('table'), this.options.exportSeparator, this.context.desc.name);
        };
    }
    static enableSort(header, body, sortable) {
        const text = ({ node: a }, { node: b }) => a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase());
        const numeric = ({ node: a }, { node: b }) => {
            const av = parseFloat(a.textContent);
            const bv = parseFloat(b.textContent);
            if (Number.isNaN(av) && Number.isNaN(bv)) {
                return a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase());
            }
            if (Number.isNaN(av)) {
                return +1;
            }
            if (Number.isNaN(bv)) {
                return -1;
            }
            return av - bv;
        };
        const sorter = (th, i, sortFunction) => {
            return () => {
                const current = th.dataset.sort;
                const rows = Array.from(body.children);
                const next = current === 'no' ? 'asc' : current === 'asc' ? 'desc' : 'no';
                th.dataset.sort = next;
                const sorting = sortFunction || (th.dataset.num != null ? numeric : text);
                const sort = (a, b) => {
                    const acol = a.children[i];
                    const bcol = b.children[i];
                    if (!acol) {
                        return bcol ? +1 : 0;
                    }
                    if (!bcol) {
                        return -1;
                    }
                    return sorting({ node: acol, row: a.__data__, index: i }, { node: bcol, row: b.__data__, index: i });
                };
                switch (next) {
                    case 'no':
                        // natural order
                        rows.sort((a, b) => parseInt(a.dataset.i, 10) - parseInt(b.dataset.i, 10));
                        break;
                    case 'desc':
                        rows.sort((a, b) => -sort(a, b));
                        break;
                    default:
                        rows.sort(sort);
                }
                // readd in ordered sequence
                body.innerHTML = '';
                rows.forEach((r) => body.appendChild(r));
            };
        };
        Array.from(header.children).forEach((d, i) => {
            const sort = typeof sortable === 'function' ? sortable(d, i) : sortable;
            if (!sort) {
                return;
            }
            d.dataset.sort = 'no';
            if (sort === 'number') {
                d.dataset.num = '';
            }
            d.onclick = sorter(d, i, typeof sort === 'function' ? sort : null);
        });
    }
    /**
     * Download the HTML Table content.
     */
    static exportHtmlTableContent(document, tableRoot, separator, name) {
        if (separator !== 'xlsx') {
            const content = ATableView.parseHtmlTableContent(tableRoot, separator);
            ATableView.download(document, new Blob([content], { type: 'text/csv;charset=utf-8' }), `${name}.csv`);
            return;
        }
        const { columns, rows } = ATableView.extractFromHTML(tableRoot);
        function isNumeric(value) {
            return typeof value === 'string' && !Number.isNaN(parseFloat(value));
        }
        // parse numbers
        const guessed = rows.map((row) => row.map((s) => (isNumeric(s) ? parseFloat(s) : s)));
        guessed.unshift(columns);
        XlsxUtils.jsonArray2xlsx(guessed).then((blob) => ATableView.download(document, blob, `${name}.xlsx`));
    }
    static download(document, blob, name) {
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = name;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    /**
     * Parse HTML Table header and body content.
     * @returns {string} The table content in csv format
     */
    static extractFromHTML(tableRoot) {
        const columns = Array.from(tableRoot.querySelectorAll('thead:first-of-type > tr > th')).map((d) => d.innerText);
        const bodyRows = Array.from(tableRoot.querySelectorAll('tbody > tr')).filter((tr) => tr.parentElement.parentElement === tableRoot || tr.parentElement === tableRoot); // only parse first nested level
        const rows = bodyRows.map((row) => {
            return Array.from(row.children).map((d) => d.innerText);
        });
        return {
            columns,
            rows,
        };
    }
    /**
     * Parse HTML Table header and body content.
     * @returns {string} The table content in csv format
     */
    static parseHtmlTableContent(tableRoot, separator) {
        /**
         * has <br> tag that is parsed as \n
         * @param {string} text
         * @returns {RegExpMatchArray | null}
         */
        const hasMultilines = (text) => {
            return text.match(/\n/g);
        };
        const { columns, rows } = ATableView.extractFromHTML(tableRoot);
        const headerContent = columns.join(separator);
        const bodyContent = rows
            .map((row) => {
            return row
                .map((text) => {
                return hasMultilines(text) || text.includes(separator) ? `"${text.replace(/\t/g, ':')}"` : text;
            })
                .join(separator);
        })
            .join('\n');
        const content = `${headerContent}\n${bodyContent}`;
        return content;
    }
}
//# sourceMappingURL=ATableView.js.map