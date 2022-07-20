import { ADialog } from 'lineupjs';
import { debounce } from 'lodash';
import { I18nextManager } from '../../i18n';
import { StructureImageColumn } from './StructureImageColumn';
// copied from lineupjs
function findFilterMissing(node) {
    return node.getElementsByClassName('lu-filter-missing')[0].previousElementSibling;
}
// copied from lineupjs
function filterMissingMarkup(bakMissing) {
    return `<label class="lu-checkbox">
      <input type="checkbox" ${bakMissing ? 'checked="checked"' : ''}>
      <span class="lu-filter-missing">Filter rows containing missing values</span>
    </label>`;
}
async function fetchSubstructure(structures, substructure) {
    const response = await fetch(`/api/rdkit/substructures/?substructure=${encodeURIComponent(substructure)}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        // @ts-ignore
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
    constructor(column, dialog, ctx) {
        super(dialog, {
            livePreview: 'filter',
        });
        this.column = column;
        this.ctx = ctx;
        this.before = this.column.getFilter();
    }
    updateFilter(filter, filterMissing) {
        this.node.querySelector(`#${this.dialog.idPrefix}_loading`).setAttribute('hidden', null);
        this.node.querySelector(`#${this.dialog.idPrefix}_error`).setAttribute('hidden', null);
        // empty input field + missing values checkbox is unchecked
        if (filter == null && !filterMissing) {
            this.column.setFilter(null);
            return;
        }
        const columnType = Object.entries(this.ctx.provider.columnTypes).find(([key, value]) => value === StructureImageColumn)[0];
        // FIXME find a better way to get all data for the structured image column from the data provider?
        const structures = this.ctx.provider.data.map((row) => row[columnType]) || [];
        // empty input field, but missing values checkbox is checked
        if (filter == null && filterMissing) {
            this.column.setFilter({ filter, filterMissing, matching: new Set(structures) }); // pass all structures as set and filter missing values in column.filter()
            return;
        }
        this.node.querySelector(`#${this.dialog.idPrefix}_loading`).removeAttribute('hidden');
        this.node.querySelector(`#${this.dialog.idPrefix}_error`).setAttribute('hidden', null);
        // input field is not empty -> search matching structures on server
        fetchSubstructure(structures, filter)
            .then(({ count }) => {
            const matching = new Set(Object.entries(count)
                .filter(([_structure, cnt]) => cnt > 0)
                .map(([structure]) => structure));
            this.column.setFilter({ filter, filterMissing, matching });
            this.node.querySelector(`#${this.dialog.idPrefix}_loading`).setAttribute('hidden', null);
        })
            .catch((error) => {
            this.node.querySelector(`#${this.dialog.idPrefix}_loading`).setAttribute('hidden', null);
            const errorNode = this.node.querySelector(`#${this.dialog.idPrefix}_error`);
            errorNode.removeAttribute('hidden');
            errorNode.textContent = I18nextManager.getInstance().i18n.t('tdp:core.lineup.RankingView.errorMessage', { message: error.message });
            this.column.setFilter({ filter, filterMissing, matching: null }); // no matching structures due to server error
        });
    }
    reset() {
        this.findInput('input[type="text"]').value = '';
        this.forEach('input[type=checkbox]', (n) => (n.checked = false));
    }
    cancel() {
        if (this.before) {
            this.updateFilter(this.before.filter === '' ? null : this.before.filter, this.before.filterMissing);
        }
        else {
            this.updateFilter(null, false);
        }
    }
    submit() {
        const filterMissing = findFilterMissing(this.node).checked;
        const input = this.findInput('input[type="text"]').value.trim();
        this.updateFilter(input === '' ? null : input, filterMissing);
        return true;
    }
    build(node) {
        const s = this.ctx.sanitize;
        const bak = this.column.getFilter() || { filter: '', filterMissing: false };
        node.insertAdjacentHTML('beforeend', `<span style="position: relative;">
         <input type="text" placeholder="Filter ${s(this.column.desc.label)} …" autofocus
         value="${bak.filter}" style="width: 100%">
         <i id="${this.dialog.idPrefix}_loading" hidden class="fas fa-circle-notch fa-spin text-muted" style="position: absolute;right: 6px;top: 6px;"></i>
         </span>
      <span id="${this.dialog.idPrefix}_error" class="text-danger" hidden></span>
      ${filterMissingMarkup(bak.filterMissing)}`);
        const filterMissing = findFilterMissing(node);
        const input = node.querySelector('input[type="text"]');
        this.enableLivePreviews([filterMissing, input]);
        if (!this.showLivePreviews()) {
            return;
        }
        input.addEventListener('input', debounce(() => this.submit(), 100), {
            passive: true,
        });
    }
}
//# sourceMappingURL=StructureImageFilterDialog.js.map