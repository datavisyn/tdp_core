import { ADialog } from 'lineupjs';
import { debounce } from 'lodash';
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
// copied from lineupjs
function setText(node, text) {
    if (text === undefined) {
        return node;
    }
    // no performance boost if setting the text node directly
    // const textNode = <Text>node.firstChild;
    // if (textNode == null) {
    //  node.appendChild(node.ownerDocument!.createTextNode(text));
    // } else {
    //  textNode.data = text;
    // }
    if (node.textContent !== text) {
        node.textContent = text;
    }
    return node;
}
// copied from lineupjs
function matchDataList(node, matches) {
    const children = Array.from(node.options);
    // update existing
    for (let i = 0; i < matches.length; i++) {
        const m = matches[i];
        let child = children[i];
        if (!child) {
            child = node.ownerDocument.createElement('option');
            node.appendChild(child);
        }
        child.value = m.value;
        setText(child, m.count > 1 ? `${m.value} (${m.count.toLocaleString()})` : m.value);
    }
    // remove extra
    for (let i = children.length - 1; i >= matches.length; i--) {
        children[i].remove();
    }
}
async function fetchSubstructure(structures, substructure) {
    var _a;
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
        throw Error(((_a = (await response.json().catch(() => null))) === null || _a === void 0 ? void 0 : _a.message) || response.statusText);
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
        const columnType = Object.entries(this.ctx.provider.columnTypes).find(([key, value]) => value === StructureImageColumn)[0];
        // FIXME find a better way to get all data for the structured image column from the data provider?
        const structures = this.ctx.provider.data.map((row) => row[columnType]) || [];
        // TODO handle error case
        fetchSubstructure(structures, filter).then(({ count }) => {
            const valid = new Set(Object.entries(count)
                .filter(([_structure, cnt]) => cnt > 0)
                .map(([structure]) => structure));
            console.log(count, valid, filter);
            if (filter == null && !filterMissing) {
                this.column.setFilter(null);
            }
            else {
                this.column.setFilter({ filter, filterMissing, valid });
            }
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
        const input = this.findInput('input[type="text"]').value;
        this.updateFilter(input, filterMissing);
        return true;
    }
    build(node) {
        const s = this.ctx.sanitize;
        const bak = this.column.getFilter() || { filter: '', filterMissing: false };
        node.insertAdjacentHTML('beforeend', `<input type="text" placeholder="Filter ${s(this.column.desc.label)} …" autofocus
         value="${bak.filter}" list="${this.dialog.idPrefix}_sdl">
    ${filterMissingMarkup(bak.filterMissing)}
    <datalist id="${this.dialog.idPrefix}_sdl"></datalist>`);
        const filterMissing = findFilterMissing(node);
        const input = node.querySelector('input[type="text"]');
        const dl = node.querySelector('datalist');
        this.ctx.provider
            .getTaskExecutor()
            .summaryStringStats(this.column)
            .then((r) => {
            if (typeof r === 'symbol') {
                return;
            }
            const { summary } = r;
            matchDataList(dl, summary.topN);
        });
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