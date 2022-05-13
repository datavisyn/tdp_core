import { difference } from 'lodash';
export class ABaseSelectionAdapter {
    async addDynamicColumns(context, ids) {
        const columns = await Promise.all(ids.map((id) => this.createColumnsFor(context, id)));
        // sort new columns to insert them in the correct order
        const flattenedColumns = [].concat(...columns).map((d, i) => ({ d, i }));
        flattenedColumns.sort(({ d: a, i: ai }, { d: b, i: bi }) => {
            if (a.position === b.position) {
                // equal position, sort latter element of original array to lower position in sorted array
                return bi - ai; // the latter in the array the better
            }
            return b.position - a.position; // sort descending by default
        });
        return context.add(flattenedColumns.map((d) => d.d));
    }
    removeDynamicColumns(context, ids) {
        const { columns } = context;
        return context.remove([].concat(...ids.map((id) => {
            context.freeColor(id);
            return columns.filter((d) => d.desc.selectedId === id);
        })));
    }
    /**
     * Add or remove columns in LineUp ranking when the selected items in the selection adapter context change
     * @param context selection adapter context
     * @returns A promise that can waited for until the columns have been changed.
     */
    selectionChanged(context) {
        return this.selectionChangedImpl(context);
    }
    /**
     * Add or remove columns in LineUp ranking when the parametrs in the selection adapter context change
     * @param context selection adapter context
     * @returns A promise that can waited for until the columns have been changed.
     */
    parameterChanged(context) {
        return this.parameterChangedImpl(context);
    }
    async selectionChangedImpl(context) {
        const selectedIds = context.selection.ids;
        const usedCols = context.columns.filter((d) => d.desc.selectedId != null);
        const lineupColIds = usedCols.map((d) => d.desc.selectedId);
        // compute the difference
        const diffAdded = difference(selectedIds, lineupColIds);
        const diffRemoved = difference(lineupColIds, selectedIds);
        // remove deselected columns
        if (diffRemoved.length > 0) {
            // console.log('remove columns', diffRemoved);
            await this.removeDynamicColumns(context, diffRemoved);
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