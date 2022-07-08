import { StringColumn, Column } from 'lineupjs';
import { isEqual } from 'lodash';
export class StructureImageColumn extends StringColumn {
    constructor() {
        super(...arguments);
        this.structureFilter = null;
        this.align = null;
    }
    filter(row) {
        if (!this.isFiltered()) {
            return true;
        }
        return this.structureFilter.valid.has(this.getLabel(row));
    }
    isFiltered() {
        var _a;
        return this.structureFilter != null && ((_a = this.structureFilter.valid) === null || _a === void 0 ? void 0 : _a.size) > 0;
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