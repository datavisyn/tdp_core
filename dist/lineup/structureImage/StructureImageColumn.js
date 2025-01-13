import { Column, StringColumn, ValueColumn } from 'lineupjs';
import { isEqual } from 'lodash';
// internal function copied from lineupjs
function integrateDefaults(desc, defaults = {}) {
    Object.keys(defaults).forEach((key) => {
        const typed = key;
        if (typeof desc[typed] === 'undefined') {
            desc[typed] = defaults[typed];
        }
    });
    return desc;
}
export class StructureImageColumn extends ValueColumn {
    constructor(id, desc) {
        super(id, integrateDefaults(desc, {
            summaryRenderer: 'default',
        }));
        this.structureFilter = null;
        this.align = null;
    }
    createEventList() {
        return super.createEventList().concat([StringColumn.EVENT_FILTER_CHANGED]);
    }
    filter(row) {
        if (!this.isFiltered()) {
            return true;
        }
        // filter out row if no valid results found
        if (this.structureFilter.matching === null) {
            return false;
        }
        const rowLabel = this.getLabel(row);
        // filter missing values
        if (rowLabel == null || rowLabel.trim() === '') {
            return !this.structureFilter.filterMissing;
        }
        return this.structureFilter.matching.has(rowLabel) ?? false;
    }
    isFiltered() {
        return this.structureFilter != null;
    }
    getFilter() {
        return this.structureFilter;
    }
    setFilter(filter) {
        if (isEqual(filter, this.structureFilter)) {
            return;
        }
        // ensure that no filter of the string column is used beyond this point
        // TODO remove once the string filter is removed from the UI
        if (filter && !filter.matching) {
            return;
        }
        this.fire([StringColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.structureFilter, (this.structureFilter = filter));
    }
    clearFilter() {
        const was = this.isFiltered();
        this.setFilter(null);
        return was;
    }
    getAlign() {
        return this.align;
    }
    setAlign(structure) {
        if (isEqual(structure, this.align)) {
            return;
        }
        this.fire([Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], (this.align = structure));
    }
}
//# sourceMappingURL=StructureImageColumn.js.map