import { StringColumn, Column } from 'lineupjs';
import { isEqual } from 'lodash';
export class StructureImageColumn extends StringColumn {
    constructor() {
        super(...arguments);
        this.structureFilter = null;
        this.align = null;
    }
    filter(row) {
        var _a;
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
        return (_a = this.structureFilter.matching.has(rowLabel)) !== null && _a !== void 0 ? _a : false;
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
        this.fire([StringColumn.EVENT_FILTER_CHANGED, Column.EVENT_DIRTY_VALUES, Column.EVENT_DIRTY], this.structureFilter, (this.structureFilter = filter));
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