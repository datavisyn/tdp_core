import { difference } from 'lodash';
import { ResolveNow } from '../../../base';
export class ABaseSelectionAdapter {
    constructor() {
        this.waitingForSelection = null;
        this.waitingForParameter = null;
    }
    addDynamicColumns(context, ids) {
        return Promise.all(ids.map((id) => this.createColumnsFor(context, id))).then((columns) => {
            // sort new columns to insert them in the correct order
            const flattenedColumns = [].concat(...columns).map((d, i) => ({ d, i }));
            flattenedColumns.sort(({ d: a, i: ai }, { d: b, i: bi }) => {
                if (a.position === b.position) {
                    // equal position, sort latter element of original array to lower position in sorted array
                    return bi - ai; // the latter in the array the better
                }
                return b.position - a.position; // sort descending by default
            });
            context.add(flattenedColumns.map((d) => d.d));
        });
    }
    removeDynamicColumns(context, ids) {
        const { columns } = context;
        context.remove([].concat(...ids.map((id) => {
            context.freeColor(id);
            return columns.filter((d) => d.desc.selectedId === id);
        })));
    }
    selectionChanged(waitForIt, context) {
        if (this.waitingForSelection) {
            return this.waitingForSelection;
        }
        return (this.waitingForSelection = ResolveNow.resolveImmediately(waitForIt)
            .then(() => this.selectionChangedImpl(context()))
            .then(() => {
            this.waitingForSelection = null;
        }));
    }
    parameterChanged(waitForIt, context) {
        if (this.waitingForSelection) {
            return this.waitingForSelection;
        }
        if (this.waitingForParameter) {
            return this.waitingForParameter;
        }
        return (this.waitingForParameter = ResolveNow.resolveImmediately(waitForIt)
            .then(() => {
            if (this.waitingForSelection) {
                return undefined; // abort selection more important
            }
            return this.parameterChangedImpl(context());
        })
            .then(() => {
            this.waitingForParameter = null;
        }));
    }
    selectionChangedImpl(context) {
        const selectedIds = context.selection.ids;
        const usedCols = context.columns.filter((d) => d.desc.selectedId != null);
        const lineupColIds = usedCols.map((d) => d.desc.selectedId);
        // compute the difference
        const diffAdded = difference(selectedIds, lineupColIds);
        const diffRemoved = difference(lineupColIds, selectedIds);
        // remove deselected columns
        if (diffRemoved.length > 0) {
            // console.log('remove columns', diffRemoved);
            this.removeDynamicColumns(context, diffRemoved);
        }
        // add new columns to the end
        if (diffAdded.length <= 0) {
            return null;
        }
        return this.addDynamicColumns(context, diffAdded);
    }
    static patchDesc(desc, selectedId) {
        desc.selectedId = selectedId;
        return desc;
    }
}
//# sourceMappingURL=ABaseSelectionAdapter.js.map