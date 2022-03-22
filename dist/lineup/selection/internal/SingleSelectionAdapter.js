import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
export class SingleSelectionAdapter extends ABaseSelectionAdapter {
    constructor(adapter) {
        super();
        this.adapter = adapter;
    }
    parameterChangedImpl(context) {
        // remove all and start again
        const selectedIds = context.selection.ids;
        const usedCols = context.columns.filter((d) => d.desc.selectedId != null);
        const lineupColIds = usedCols.map((d) => d.desc.selectedId);
        // remove deselected columns
        if (lineupColIds.length > 0) {
            this.removeDynamicColumns(context, lineupColIds);
        }
        // add new columns to the end
        if (selectedIds.length <= 0) {
            return null;
        }
        return this.addDynamicColumns(context, selectedIds);
    }
    createColumnsFor(context, id) {
        return Promise.resolve(this.adapter.createDesc(id)).then((desc) => [
            {
                desc: ABaseSelectionAdapter.patchDesc(desc, id),
                data: this.adapter.loadData(id),
                id,
            },
        ]);
    }
}
//# sourceMappingURL=SingleSelectionAdapter.js.map