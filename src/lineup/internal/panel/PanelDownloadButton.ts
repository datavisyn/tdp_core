import {LocalDataProvider} from 'lineupjs';
import {ExportUtils} from '../ExportUtils';
import {IPanelButton} from './PanelButton';
import {I18nextManager} from 'phovea_core';


/**
 * A button dropdown to download selected/all rows of the ranking
 */
export class PanelDownloadButton implements IPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private provider: LocalDataProvider, isTopMode:boolean) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('btn-group', 'download-data-dropdown');
    this.node.innerHTML = `
    <button type="button" class="dropdown-toggle fa fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadData')}">
    </button>
    <ul class="dropdown-menu dropdown-menu-${isTopMode ? 'left' : 'right'}">
      <li class="dropdown-header">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadAll')}</li>
      <li><a href="#" data-s="a" data-t="xlsx">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.excel')}</a></li>
      <li class="dropdown-header" data-num-selected-rows="0">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.downloadSelectedRows')}</li>
      <li><a href="#" data-s="s" data-t="xlsx">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.excel')}</a></li>
      <li role="separator" class="divider"></li>
      <li><a href="#" data-s="s" data-t="custom">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.customize')}</a></li>
    </ul>
  `;

    // Listen for row selection and update number of selected rows
    // Show/hide some dropdown menu points accordingly using CSS
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + '.download-menu', (indices: number[]) => {
      (<HTMLElement>this.node.querySelector('[data-num-selected-rows]')).dataset.numSelectedRows = indices.length.toString();
    });

    const links = Array.from(this.node.querySelectorAll('a'));
    for (const link of links) {
      link.onclick = (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        const type = link.dataset.t;
        const onlySelected = link.dataset.s === 's';
        ExportUtils.exportLogic(<any>type, onlySelected, this.provider).then(({content, mimeType, name}) => {
          this.downloadFile(content, mimeType, name);
        });
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
