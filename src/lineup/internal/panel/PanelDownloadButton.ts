import {Column, LocalDataProvider, isSupportType} from 'lineupjs';
import {ExportUtils, IExportFormat} from '../ExportUtils';
import {IPanelButton} from './PanelButton';
import {BaseUtils, I18nextManager} from 'phovea_core';
import {LineUpOrderedRowIndicies} from './LineUpOrderedRowIndicies';

interface IExportData {
  type: IExportFormat;
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
      <button type="button" class="dropdown-toggle fas fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadData')}">
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
      link.onclick = (_evt) => {
        let promise: Promise<IExportData>;

        switch(link.dataset.format) {
          case 'custom':
            promise = this.customizeDialog(provider, lineupOrderRowIndices);
            break;

          default:
            const ranking = provider.getFirstRanking();
            promise = Promise.resolve({
              order: lineupOrderRowIndices[link.dataset.rows],
              columns: ranking.flatColumns.filter((c) => !isSupportType(c)),
              type: ExportUtils.getExportFormat(link.dataset.format),
              name: ranking.getLabel()
            });
        }

        promise
          .then((r) => {
            return r.type.getRankingContent(r.columns, provider.viewRawRows(r.order))
              .then((blob) => ({ // wait for blob then transform object
                content: blob,
                mimeType: r.type.mimeType,
                name: `${r.name}${r.type.fileExtension}`,
              }));
          })
          .then(({content, mimeType, name}) => {
            this.downloadFile(content, mimeType, name);
          });

        return false;
      };
    });
  }

  private customizeDialog(provider: LocalDataProvider, orderedRowIndices: LineUpOrderedRowIndicies): Promise<IExportData> {
    return import('phovea_ui/dist/components/dialogs').then((dialogs) => {
      const dialog = new dialogs.FormDialog(`${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportData')}`, `<i class="fa fa-download"></i>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.export')}`);
      const id = `e${BaseUtils.randomId(3)}`;
      const ranking = provider.getFirstRanking();
      dialog.form.classList.add('tdp-ranking-export-form');
      const flat = ranking.flatColumns.filter((c) => c.label.trim().length > 0);
      const lookup = new Map(flat.map((d) => <[string, Column]>[d.id, d]));
      dialog.form.innerHTML = `
        <div class="form-group">
          <h5>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.columns')}</h5>
          <p class="text-info"><i class="fas fa-info-circle"></i> ${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.columnsReorderTip')}</p>
          <p class="error-columns">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.columnsError')}</p>
          ${flat.map((col) => `
            <div class="checkbox tdp-ranking-export-form-handle">
              <i class="fas fa-grip-vertical"></i>
              <label>
                <input type="checkbox" name="columns" value="${col.id}" ${!isSupportType(col) ? 'checked' : ''}>
                ${col.label}
              </label>
            </div>
          `).join('')}
        </div>
        <div class="form-group">
          <h5>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.rows')}</h5>
          <div class="radio" data-num-rows="${orderedRowIndices.all.length}"><label><input type="radio" name="rows" value="all" checked>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.allRows')} (${orderedRowIndices.all.length})</label></div>
          <div class="radio" data-num-rows="${orderedRowIndices.filtered.length}"><label><input type="radio" name="rows" value="filtered">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.filteredRows')} (${orderedRowIndices.filtered.length})</label></div>
          <div class="radio" data-num-rows="${orderedRowIndices.selected.length}"><label><input type="radio" name="rows" value="selected">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.selectedRows')} (${orderedRowIndices.selected.length})</label></div>
        </div>
        <div class="form-group">
          <label for="name_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportFileName')}</label>
          <input class="form-control" id="name_${id}" name="name" value="Export" required>
        </div>
        <div class="form-group">
          <label for="type_${id}">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.exportFormat')}</label>
          <select class="form-control" id="type_${id}" name="type" required>
          <option value="CSV">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.csvComma')}</option>
          <option value="TSV">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.tsv')}</option>
          <option value="SSV">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.csvColon')}</option>
          <option value="JSON">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.json')}</option>
          <option value="XLSX" selected>${I18nextManager.getInstance().i18n.t('tdp:core.lineup.export.excel')}</option>
          </select>
        </div>
      `;

      dialog.form.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          dialog.form.querySelector('.error-columns').parentElement.classList.toggle('has-error', (dialog.form.querySelectorAll('input[type="checkbox"]:checked').length === 0));
        });
      });

      this.resortAble(<HTMLElement>dialog.form.firstElementChild!, '.checkbox');

      return new Promise<IExportData>((resolve) => {
        dialog.onSubmit(() => {
          const data = new FormData(dialog.form);

          if(data.getAll('columns').length === 0) {
            return false;
          }

          dialog.hide();

          resolve({
            type: ExportUtils.getExportFormat(<string>data.get('type')),
            columns: data.getAll('columns').map((d) => lookup.get(d.toString())),
            order: orderedRowIndices[data.get('rows').toString()],
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

  private resortAble(base: HTMLElement, elementSelector: string) {
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
