import { EDirtyReason, LocalDataProvider, Ranking, isSupportType } from 'lineupjs';
import { ExportUtils } from '../ExportUtils';
import { BaseUtils, I18nextManager } from 'phovea_core';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export class PanelDownloadButton {
    constructor(parent, provider, isTopMode) {
        this.provider = provider;
        this.orderedRowIndices = {
            /**
             * All row indices from the data provider.
             * Indices are not sorting (= sorting of input data)!
             */
            all: [],
            /**
             * Indices of the selected rows.
             * Indices are sorted by the *first* ranking.
             */
            selected: [],
            /**
             * Indices of the filtered rows.
             * Indices are sorted and filtered by the *first* ranking.
             */
            filtered: []
        };
        this.node = parent.ownerDocument.createElement('div');
        this.node.classList.add('btn-group', 'download-data-dropdown');
        this.node.innerHTML = `
      <button type="button" class="dropdown-toggle fa fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadData')}">
      </button>
      <ul class="dropdown-menu dropdown-menu-${isTopMode ? 'left' : 'right'}">
        <li class="dropdown-header">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadAsExcel')}</li>
        <li data-num-all-rows="0"><a href="#" data-rows="all" data-format="xlsx" data-num-all-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadEntireList')}</a></li>
        <li data-num-filtered-rows="0"><a href="#" data-rows="filtered" data-format="xlsx" data-num-filtered-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadFilteredRows')}</a></li>
        <li data-num-selected-rows="0"><a href="#" data-rows="selected" data-format="xlsx" data-num-selected-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadSelectedRows')}</a></li>
        <li role="separator" class="divider"></li>
        <li><a href="#" data-rows="custom" data-format="custom">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.customize')}</a></li>
      </ul>
    `;
        this.addLineUpEventListner();
        this.node.querySelectorAll('a').forEach((link) => {
            link.onclick = (evt) => {
                evt.preventDefault();
                evt.stopPropagation();
                let promise;
                switch (link.dataset.format) {
                    case 'custom':
                        promise = this.customizeDialog(provider);
                        break;
                    default:
                        const ranking = provider.getFirstRanking();
                        promise = Promise.resolve({
                            order: this.orderedRowIndices[link.dataset.rows],
                            columns: ranking.flatColumns.filter((c) => !isSupportType(c)),
                            type: ExportUtils.getExportFormat(link.dataset.format),
                            name: ranking.getLabel()
                        });
                }
                return promise
                    .then((r) => {
                    return r.type.getRankingContent(r.columns, provider.viewRawRows(r.order))
                        .then((blob) => ({
                        content: blob,
                        mimeType: r.type.mimeType,
                        name: `${r.name}${r.type.fileExtension}`,
                    }));
                })
                    .then(({ content, mimeType, name }) => {
                    this.downloadFile(content, mimeType, name);
                });
            };
        });
    }
    updateNumRowsAttributes() {
        this.node.querySelectorAll('[data-num-all-rows]').forEach((element) => element.dataset.numAllRows = this.orderedRowIndices.all.length.toString());
        this.node.querySelectorAll('[data-num-selected-rows]').forEach((element) => element.dataset.numSelectedRows = this.orderedRowIndices.selected.length.toString());
        this.node.querySelectorAll('[data-num-filtered-rows]').forEach((element) => element.dataset.numFilteredRows = this.orderedRowIndices.filtered.length.toString());
    }
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    addLineUpEventListner() {
        const eventSuffix = '.download-menu';
        this.provider.on(LocalDataProvider.EVENT_DATA_CHANGED + eventSuffix, (rows) => {
            this.orderedRowIndices.all = rows.map((d) => d.i);
            this.updateNumRowsAttributes();
        });
        this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + eventSuffix, (_indices) => {
            // NOTE: the `indices` does not reflect the sorting of the (first) ranking, instead the ids are always ordered ascending
            const order = Array.from(this.provider.getFirstRanking().getOrder()); // use order of the first ranking
            this.orderedRowIndices.selected = this.sortValues(this.provider.getSelection(), order);
            this.updateNumRowsAttributes();
        });
        // wait until (first) ranking is added to data provider
        this.provider.on(LocalDataProvider.EVENT_ADD_RANKING, (_ranking, _index) => {
            // TODO: implement support for multiple rankings; currently, only the first ranking is supported
            this.provider.getFirstRanking().on(Ranking.EVENT_ORDER_CHANGED + eventSuffix, (_previous, current, _previousGroups, _currentGroups, dirtyReason) => {
                // update filtered rows on filter and sort events
                if (dirtyReason.indexOf(EDirtyReason.FILTER_CHANGED) > -1 || dirtyReason.indexOf(EDirtyReason.SORT_CRITERIA_CHANGED) > -1) {
                    // no rows are filtered -> reset array
                    if (current.length === this.orderedRowIndices.all.length) {
                        this.orderedRowIndices.filtered = [];
                        // some rows are filtered
                    }
                    else {
                        // NOTE: `current` contains always the *sorted* and *filtered* row indices of the (first) ranking!
                        this.orderedRowIndices.filtered = (current instanceof Uint8Array || current instanceof Uint16Array || current instanceof Uint32Array) ? Array.from(current) : current; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
                    }
                }
                // update sorting of selected rows
                if (dirtyReason.indexOf(EDirtyReason.SORT_CRITERIA_CHANGED) > -1) {
                    const order = Array.from(this.provider.getFirstRanking().getOrder()); // use order of the first ranking
                    this.orderedRowIndices.selected = this.sortValues(this.provider.getSelection(), order);
                }
                this.updateNumRowsAttributes();
            });
        });
        this.provider.on(LocalDataProvider.EVENT_REMOVE_RANKING, (_ranking, _index) => {
            // TODO: implement support for multiple rankings; currently, only the first ranking is supported
            this.provider.getFirstRanking().on(Ranking.EVENT_ORDER_CHANGED + eventSuffix, null);
        });
    }
    sortValues(values, order) {
        return values.sort((a, b) => {
            const aIndex = order.indexOf(a);
            const bIndex = order.indexOf(b);
            return (aIndex > -1 ? aIndex : Infinity) - (bIndex > -1 ? bIndex : Infinity); // sort missing values in the order array to the end
        });
    }
    customizeDialog(provider) {
        return import('phovea_ui/dist/components/dialogs').then((dialogs) => {
            const dialog = new dialogs.FormDialog(`${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportData')}`, `<i class="fa fa-download"></i>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.export')}`);
            const id = `e${BaseUtils.randomId(3)}`;
            const ranking = provider.getFirstRanking();
            dialog.form.classList.add('tdp-ranking-export-form');
            const flat = ranking.flatColumns;
            const lookup = new Map(flat.map((d) => [d.id, d]));
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
          <div class="radio" data-num-rows="${this.orderedRowIndices.all.length}"><label><input type="radio" name="rows" value="all" checked>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.allRows')} (${this.orderedRowIndices.all.length})</label></div>
          <div class="radio" data-num-rows="${this.orderedRowIndices.filtered.length}"><label><input type="radio" name="rows" value="filtered">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.filteredRows')} (${this.orderedRowIndices.filtered.length})</label></div>
          <div class="radio" data-num-rows="${this.orderedRowIndices.selected.length}"><label><input type="radio" name="rows" value="selected">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.selectedRows')} (${this.orderedRowIndices.selected.length})</label></div>
        </div>
        <div class="form-group">
          <label for="name_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportName')}</label>
          <input class="form-control" id="name_${id}" name="name" value="Export" placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.nameOfExported')}">
        </div>
        <div class="form-group">
          <label for="type_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportFormatCapital')}</label>
          <select class="form-control" id="type_${id}" name="type" required placeholder="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportFormat')}">
          <option value="CSV" selected>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.csvComma')}</option>
          <option value="TSV">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.tsv')}</option>
          <option value="SSV">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.csvColon')}</option>
          <option value="JSON">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.json')}</option>
          <option value="XLSX">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.excel')}</option>
          </select>
        </div>
      `;
            this.resortAble(dialog.form.firstElementChild, '.checkbox');
            return new Promise((resolve) => {
                dialog.onSubmit(() => {
                    const data = new FormData(dialog.form);
                    dialog.hide();
                    resolve({
                        type: ExportUtils.getExportFormat(data.get('type')),
                        columns: data.getAll('columns').map((d) => lookup.get(d.toString())),
                        order: this.orderedRowIndices[data.get('rows').toString()],
                        name: data.get('name')
                    });
                    return false;
                });
                dialog.show();
                setTimeout(() => {
                    const first = dialog.form.querySelector('input, select, textarea');
                    if (first) {
                        first.focus();
                    }
                }, 250); // till dialog is visible
            });
        });
    }
    resortAble(base, elementSelector) {
        const items = Array.from(base.querySelectorAll(elementSelector));
        const enable = (item) => {
            item.classList.add('dragging');
            base.classList.add('dragging');
            let prevBB;
            let nextBB;
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
                    item.parentElement.insertBefore(item, item.previousElementSibling);
                    update();
                }
                else if (nextBB && y > (nextBB.top + nextBB.height / 2)) {
                    // move down
                    item.parentElement.insertBefore(item.nextElementSibling, item);
                    update();
                }
                evt.preventDefault();
                evt.stopPropagation();
            };
        };
        for (const item of items) {
            const handle = item.firstElementChild;
            handle.onmousedown = () => {
                enable(item);
            };
        }
    }
    downloadFile(content, mimeType, name) {
        const doc = this.node.ownerDocument;
        const downloadLink = doc.createElement('a');
        const blob = new Blob([content], { type: mimeType });
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = name;
        doc.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
    }
}
//# sourceMappingURL=PanelDownloadButton.js.map