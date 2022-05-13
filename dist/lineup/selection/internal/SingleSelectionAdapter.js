import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
export class SingleSelectionAdapter extends ABaseSelectionAdapter {
    constructor(adapter) {
        super();
        this.adapter = adapter;
    }
    async parameterChangedImpl(context) {
        // TODO check if why it is necessary to remove **all** dynamic columns on parameter change and if it can be refactored so that it works the same as `MultiSelectionAdapter.parameterChangedImpl()`
        // remove **all** dynamic columns and start again
        const selectedIds = context.selection.ids;
        const usedCols = context.columns.filter((d) => d.desc.selectedId != null);
        const lineupColIds = usedCols.map((d) => d.desc.selectedId);
        // remove deselected columns
        if (lineupColIds.length > 0) {
            await this.removeDynamicColumns(context, lineupColIds);
        }
        // add new columns to the end
        if (selectedIds.length <= 0) {
            return null;
        }
        return this.addDynamicColumns(context, selectedIds);
    }
    /**
     * Creates a single column desc with additional metadata for a given selected id.
     *
     * @param context selection adapter context
     * @param id id of the selected item
     * @returns A promise with a list containing a single columns + additional metadata
     */
    async createColumnsFor(_context, id) {
        const desc = await this.adapter.createDesc(id);
        return [
            {
                desc: ABaseSelectionAdapter.patchDesc(desc, id),
                data: this.adapter.loadData(id),
                id,
            },
        ];
    }
}
//# sourceMappingURL=SingleSelectionAdapter.js.map