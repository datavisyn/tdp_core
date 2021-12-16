import { ResolveNow } from '../../../base';
import { LineupUtils } from '../../utils';
export class ABaseSelectionAdapter {
    constructor() {
        this.waitingForSelection = null;
        this.waitingForParameter = null;
    }
    addDynamicColumns(context, _ids, ids) {
        return Promise.all(_ids.map((_id, i) => this.createColumnsFor(context, _id, ids[i]))).then((columns) => {
            // sort new columns to insert them in the correct order
            const flattenedColumns = [].concat(...columns).map((d, i) => ({ d, i }));
            flattenedColumns.sort(({ d: a, i: ai }, { d: b, i: bi }) => {
                if (a.position === b.position) { // equal position, sort latter element of original array to lower position in sorted array
                    return bi - ai; // the latter in the array the better
                }
                return b.position - a.position; // sort descending by default
            });
            context.add(flattenedColumns.map((d) => d.d));
        });
    }
    removeDynamicColumns(context, _ids) {
        const columns = context.columns;
        context.remove([].concat(..._ids.map((_id) => {
            context.freeColor(_id);
            return columns.filter((d) => d.desc.selectedId === _id);
        })));
    }
    selectionChanged(waitForIt, context) {
        if (this.waitingForSelection) {
            return this.waitingForSelection;
        }
        return this.waitingForSelection = ResolveNow.resolveImmediately(waitForIt).then(() => this.selectionChangedImpl(context())).then(() => {
            this.waitingForSelection = null;
        });
    }
    parameterChanged(waitForIt, context) {
        if (this.waitingForSelection) {
            return this.waitingForSelection;
        }
        if (this.waitingForParameter) {
            return this.waitingForParameter;
        }
        return this.waitingForParameter = ResolveNow.resolveImmediately(waitForIt).then(() => {
            if (this.waitingForSelection) {
                return; // abort selection more important
            }
            return this.parameterChangedImpl(context());
        }).then(() => {
            this.waitingForParameter = null;
        });
    }
    selectionChangedImpl(context) {
        const selectedIds = context.selection.range.dim(0).asList();
        const usedCols = context.columns.filter((d) => d.desc.selectedId !== -1 && d.desc.selectedId !== undefined);
        const lineupColIds = usedCols.map((d) => d.desc.selectedId);
        // compute the difference
        const diffAdded = LineupUtils.array_diff(selectedIds, lineupColIds);
        const diffRemoved = LineupUtils.array_diff(lineupColIds, selectedIds);
        // remove deselected columns
        if (diffRemoved.length > 0) {
            //console.log('remove columns', diffRemoved);
            this.removeDynamicColumns(context, diffRemoved);
        }
        // add new columns to the end
        if (diffAdded.length <= 0) {
            return null;
        }
        //console.log('add columns', diffAdded);
        return context.selection.idtype.unmap(diffAdded).then((names) => this.addDynamicColumns(context, diffAdded, names));
    }
    static patchDesc(desc, selectedId) {
        desc.selectedId = selectedId;
        return desc;
    }
}
//# sourceMappingURL=ABaseSelectionAdapter.js.map