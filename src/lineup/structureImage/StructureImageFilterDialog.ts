import { ADialog, IDialogContext, IRankingHeaderContext, LocalDataProvider } from 'lineupjs';
import { debounce } from 'lodash';
import { I18nextManager } from 'visyn_core';
import { IStructureImageFilter, StructureImageColumn } from './StructureImageColumn';

// copied from lineupjs
function findFilterMissing(node: HTMLElement) {
  return (node.getElementsByClassName('lu-filter-missing')[0] as HTMLElement).previousElementSibling as HTMLInputElement;
}

async function fetchSubstructure(structures: string[], substructure: string): Promise<{ count: { [key: string]: number }; valid: { [key: string]: boolean } }> {
  const response = await fetch(`/api/rdkit/substructures/?substructure=${encodeURIComponent(substructure)}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    // mode: '*cors', // no-cors, *cors, same-origin
    method: 'POST',
    redirect: 'follow',
    ...(structures
      ? {
          body: JSON.stringify(structures),
        }
      : {}),
  });
  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw Error(json.detail[0].msg || response.statusText);
  }
  return response.json();
}

export class StructureImageFilterDialog extends ADialog {
  private readonly before: IStructureImageFilter | null;

  constructor(private readonly column: StructureImageColumn, dialog: IDialogContext, private readonly ctx: IRankingHeaderContext) {
    super(dialog, {
      livePreview: 'filter',
    });

    this.before = this.column.getFilter();
  }

  private findLoadingNode(node: HTMLElement) {
    return node.querySelector(`#${this.dialog.idPrefix}_loading`);
  }

  private findErrorNode(node: HTMLElement) {
    return node.querySelector(`#${this.dialog.idPrefix}_error`);
  }

  private updateFilter(filter: string | null, filterMissing: boolean) {
    this.findLoadingNode(this.node).setAttribute('hidden', null);
    this.findErrorNode(this.node).setAttribute('hidden', null);

    // empty input field + missing values checkbox is unchecked
    if (filter == null && !filterMissing) {
      this.column.setFilter(null);
      return;
    }

    const provider = this.ctx.provider as LocalDataProvider;
    const structures = provider.viewRawRows(provider.data.map((_, i) => i)).map((d) => this.column.getValue(d));

    // empty input field, but missing values checkbox is checked
    if (filter == null && filterMissing) {
      this.column.setFilter({ filter, filterMissing, matching: new Set(structures) }); // pass all structures as set and filter missing values in column.filter()
      return;
    }

    this.findLoadingNode(this.node).removeAttribute('hidden');
    this.findErrorNode(this.node).setAttribute('hidden', null);

    // input field is not empty -> search matching structures on server
    fetchSubstructure(structures, filter)
      .then(({ count }) => {
        const matching = new Set(
          Object.entries(count)
            .filter(([, cnt]) => cnt > 0)
            .map(([structure]) => structure),
        );

        this.column.setFilter({ filter, filterMissing, matching });
        this.findLoadingNode(this.node).setAttribute('hidden', null);
      })
      .catch((error: Error) => {
        this.findLoadingNode(this.node).setAttribute('hidden', null);

        const errorNode = this.findErrorNode(this.node);
        errorNode.removeAttribute('hidden');
        errorNode.textContent = I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.structureImage.errorMessage', { message: error.message });

        this.column.setFilter({ filter, filterMissing, matching: null }); // no matching structures due to server error
      });
  }

  protected reset() {
    this.findInput('input[type="text"]').value = '';
    this.forEach('input[type=checkbox]', (n: HTMLInputElement) => {
      // eslint-disable-next-line no-param-reassign
      n.checked = false;
    });
  }

  protected cancel() {
    if (this.before) {
      this.updateFilter(this.before.filter === '' ? null : this.before.filter, this.before.filterMissing);
    } else {
      this.updateFilter(null, false);
    }
  }

  protected submit() {
    const filterMissing = findFilterMissing(this.node).checked;
    const input = this.findInput('input[type="text"]').value.trim();
    this.updateFilter(input === '' ? null : input, filterMissing);
    return true;
  }

  protected build(node: HTMLElement) {
    const s = this.ctx.sanitize;
    const bak = this.column.getFilter() || { filter: '', filterMissing: false };
    node.insertAdjacentHTML(
      'beforeend',
      `<span style="position: relative;">
         <input type="text" placeholder="Substructure filter of ${s(this.column.desc.label)} …" autofocus
         value="${bak.filter}" style="width: 100%">
         <i id="${this.dialog.idPrefix}_loading" hidden class="fas fa-circle-notch fa-spin text-muted" style="position: absolute;right: 6px;top: 6px;"></i>
         </span>
      <span id="${this.dialog.idPrefix}_error" class="text-danger" hidden></span>
      <label class="lu-checkbox">
        <input type="checkbox" ${bak.filterMissing ? 'checked="checked"' : ''}>
        <span class="lu-filter-missing">${I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.structureImage.filterMissingValues')}</span>
      </label>`,
    );

    const filterMissing = findFilterMissing(node);
    const input = node.querySelector<HTMLInputElement>('input[type="text"]');

    this.enableLivePreviews([filterMissing, input]);

    if (!this.showLivePreviews()) {
      return;
    }
    input.addEventListener(
      'input',
      debounce(() => this.submit(), 100),
      {
        passive: true,
      },
    );
  }
}
