import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { ResolveNow } from '../../../base';
export class SingleSelectionAdapter extends ABaseSelectionAdapter {
    constructor(adapter) {
        super();
        this.adapter = adapter;
    }
    parameterChangedImpl(context) {
        // remove all and start again
        const selectedIds = context.selection.range.dim(0).asList();
        const usedCols = context.columns.filter((d) => d.desc.selectedId !== -1 && d.desc.selectedId !== undefined);
        const lineupColIds = usedCols.map((d) => d.desc.selectedId);
        // remove deselected columns
        if (lineupColIds.length > 0) {
            this.removeDynamicColumns(context, lineupColIds);
        }
        // add new columns to the end
        if (selectedIds.length <= 0) {
            return null;
        }
        return context.selection.idtype.unmap(selectedIds).then((names) => this.addDynamicColumns(context, selectedIds, names));
    }
    createColumnsFor(context, _id, id) {
        return ResolveNow.resolveImmediately(this.adapter.createDesc(_id, id)).then((desc) => [{
                desc: ABaseSelectionAdapter.patchDesc(desc, _id),
                data: this.adapter.loadData(_id, id),
                id: _id
            }]);
    }
}
//# sourceMappingURL=SingleSelectionAdapter.js.map