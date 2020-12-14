import {Column, EDirtyReason, IDataRow, IOrderedGroup, LocalDataProvider, Ranking, isSupportType} from 'lineupjs';
import {ExportFormat, ExportUtils} from '../ExportUtils';
import {IPanelButton} from './PanelButton';
import {BaseUtils, I18nextManager} from 'phovea_core';
import {LineUpOrderedRowIndicies} from './LineUpOrderedRowIndicies';

interface IExportData {
  type: ExportFormat;
  columns: Column[];
  order: number[];
  name: string;
}

/**
 * A button dropdown to download selected/all rows of the ranking
 */
export class PanelDownloadButton implements IPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, provider: LocalDataProvider, lineupOrderRowIndices: LineUpOrderedRowIndicies, isTopMode:boolean) {
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

    lineupOrderRowIndices.on(LineUpOrderedRowIndicies.EVENT_UPDATE_ALL, (_event, order: number[]) => {
      (<NodeListOf<HTMLElement>>this.node.querySelectorAll('[data-num-all-rows]')).forEach((element) => element.dataset.numAllRows = order.length.toString());
    });

    lineupOrderRowIndices.on(LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED, (_event, order: number[]) => {
      (<NodeListOf<HTMLElement>>this.node.querySelectorAll('[data-num-selected-rows]')).forEach((element) => element.dataset.numSelectedRows = order.length.toString());
    });

    lineupOrderRowIndices.on(LineUpOrderedRowIndicies.EVENT_UPDATE_FILTERED, (_event, order: number[]) => {
      (<NodeListOf<HTMLElement>>this.node.querySelectorAll('[data-num-filtered-rows]')).forEach((element) => element.dataset.numFilteredRows = order.length.toString());
    });

    this.node.querySelectorAll('a').forEach((link) => {
      link.onclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();

        let promise;

        switch(link.dataset.format) {
          case 'custom':
            promise = this.customizeDialog(provider, lineupOrderRowIndices);
            break;

          default:
            const ranking = provider.getFirstRanking();
            const columns = ranking.flatColumns.filter((c) => !isSupportType(c));

            let order: number[];
            switch(link.dataset.rows) {
              case 'selected':
                order = lineupOrderRowIndices.selected;
                break;
              case 'filtered':
                order = lineupOrderRowIndices.filtered;
                break;
              default:
                order = lineupOrderRowIndices.all;
            }

            promise = Promise.resolve({
              order,
              columns,
              type: <ExportFormat>link.dataset.format,
              name: ranking.getLabel()
            });
        }

        return promise
          .then((r) => this.convertRanking(provider, r.order, r.columns, r.type, r.name))
          .then(({content, mimeType, name}) => {
            this.downloadFile(content, mimeType, name);
          });
      };
    });
  }

  private convertRanking(provider: LocalDataProvider, order: number[], columns: Column[], type: ExportFormat, name: string) {
    const rows = provider.viewRawRows(order);
    const separators = {csv: ',', tsv: '\t', ssv: ';'};
    let content: Promise<Blob> | Blob;
    const mimeTypes = {csv: 'text/csv', tsv: 'text/tab-separated-values', ssv: 'text/csv', json: 'application/json', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'};
    const mimeType = mimeTypes[type];

    function toBlob(content: string, mimeType: string) {
      return new Blob([content], {type: mimeType});
    }

    if (type in separators) {
      content = toBlob(ExportUtils.exportRanking(columns, rows, separators[type]), mimeType);
    } else if (type === 'xlsx') {
      content = ExportUtils.exportXLSX(columns, rows);
    } else { // json
      content = toBlob(ExportUtils.exportJSON(columns, rows), mimeType);
    }
    return Promise.resolve(content).then((c) => ({
      content: c,
      mimeType: mimeTypes[type],
      name: `${name}.${type === 'ssv' ? 'csv' : type}`
    }));
  }

  private customizeDialog(provider: LocalDataProvider, orderedRowIndices: LineUpOrderedRowIndicies): Promise<IExportData> {
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

  private downloadFile(content: BufferSource | Blob | string, mimeType: string, name: string) {
    const doc = this.node.ownerDocument;
    const downloadLink = doc.createElement('a');
    const blob = new Blob([content], {type: mimeType});
    downloadLink.href = URL.createObjectURL(blob);
    (<any>downloadLink).download = name;

    doc.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
}
