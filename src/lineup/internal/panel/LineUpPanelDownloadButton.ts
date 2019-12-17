import {LocalDataProvider} from 'lineupjs';
import {exportLogic} from '../export';
import {ILineUpPanelButton} from './LineUpPanelButton';

export default class LineUpPanelDownloadButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private provider: LocalDataProvider, isTopMode: boolean) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('btn-group', 'download-data-dropdown');
    this.node.innerHTML = `
      <button type="button" class="dropdown-toggle fa fa-download" style="width: 100%;" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Download Data">
      </button>
      <ul class="dropdown-menu dropdown-menu-${isTopMode ? 'left' : 'right'}">
        <li class="dropdown-header">Download All Rows</li>
        <li><a href="#" data-s="a" data-t="xlsx">Microsoft Excel (xlsx)</a></li>
        <li class="dropdown-header" data-num-selected-rows="0">Download Selected Rows Only</li>
        <li><a href="#" data-s="s" data-t="xlsx">Microsoft Excel (xlsx)</a></li>
        <li role="separator" class="divider"></li>
        <li><a href="#" data-s="s" data-t="custom">Customize &hellip;</a></li>
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
        exportLogic(<any>type, onlySelected, this.provider).then(({content, mimeType, name}) => {
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
