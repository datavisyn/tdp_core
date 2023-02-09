import { LocalDataProvider } from 'lineupjs';
import { difference } from 'lodash';
import { EventHandler } from '../../base';
export class LineUpSelectionHelper extends EventHandler {
    constructor(provider, idType, { idField = 'id', } = {}) {
        super();
        this.provider = provider;
        this.idType = idType;
        this._rows = [];
        /**
         * selected indices ordered by selection order, i.e. the first selected is the 0. item
         * @type {number[]}
         */
        this.orderedSelectedIndices = [];
        this.uid2index = new Map();
        this.addEventListener();
        this.idField = idField;
    }
    buildCache() {
        this.uid2index.clear();
        // create lookup cache
        this._rows.forEach((row, i) => {
            this.uid2index.set(row[this.idField], i);
        });
    }
    addEventListener() {
        this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED, (indices) => {
            this.onMultiSelectionChanged(indices);
        });
    }
    removeEventListener() {
        this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED, null);
    }
    onMultiSelectionChanged(indices) {
        // compute the difference
        const diffAdded = difference(indices, this.orderedSelectedIndices);
        const diffRemoved = difference(this.orderedSelectedIndices, indices);
        // remove elements within, but preserve order
        diffRemoved.forEach((d) => {
            this.orderedSelectedIndices.splice(this.orderedSelectedIndices.indexOf(d), 1);
        });
        // add new element to the end
        diffAdded.forEach((d) => {
            this.orderedSelectedIndices.push(d);
        });
        const idType = this.idType();
        if (!idType) {
            console.warn('no idType defined for this ranking view');
            return;
        }
        const selection = { idtype: idType, ids: this.orderedSelectedIndices.map((i) => this._rows[i][this.idField]) };
        // Note: listener of that event calls LineUpSelectionHelper.setItemSelection()
        this.fire(LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION, selection);
    }
    set rows(rows) {
        this._rows = rows;
        this.buildCache();
    }
    get rows() {
        return this._rows;
    }
    /**
     * gets the rows ids as a set, i.e. the order doesn't mean anything
     */
    rowIdsAsSet(indices) {
        return (indices.length === this._rows.length ? this._rows.map((d) => d[this.idField]) : indices.map((i) => this._rows[i][this.idField])).sort();
    }
    setItemSelection(sel) {
        if (!this.provider) {
            return;
        }
        const old = this.provider.getSelection().sort();
        const indices = [];
        sel.ids.forEach((uid) => {
            const index = this.uid2index.get(uid);
            if (typeof index === 'number') {
                indices.push(index);
            }
        });
        indices.sort();
        if (old.length === indices.length && indices.every((v, j) => old[j] === v)) {
            return; // no change
        }
        // What are these remove and add event listeners doing ? They mess with my event listeners as well
        this.removeEventListener();
        this.provider.setSelection(indices);
        this.addEventListener();
    }
    setGeneralVisSelection(sel) {
        if (!this.provider) {
            return;
        }
        const old = this.provider.getSelection().sort((a, b) => a - b);
        const indices = [];
        sel.ids.forEach((uid) => {
            const index = this.uid2index.get(String(uid));
            if (typeof index === 'number') {
                indices.push(index);
            }
        });
        indices.sort((a, b) => a - b);
        if (old.length === indices.length && indices.every((v, j) => old[j] === v)) {
            return; // no change
        }
        this.provider.setSelection(indices);
    }
}
LineUpSelectionHelper.EVENT_SET_ITEM_SELECTION = 'setItemSelection';
//# sourceMappingURL=LineUpSelectionHelper.js.map