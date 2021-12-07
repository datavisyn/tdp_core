import { LineupUtils } from '../../utils';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { ResolveNow } from '../../../base';
export class MultiSelectionAdapter extends ABaseSelectionAdapter {
    constructor(adapter) {
        super(adapter);
        this.adapter = adapter;
    }
    parameterChangedImpl(context) {
        const selectedIds = context.selection.range.dim(0).asList();
        if (this.adapter.selectionLimit) {
            selectedIds.length = this.adapter.selectionLimit;
        }
        this.removePartialDynamicColumns(context, selectedIds);
        return context.selection.idtype.unmap(selectedIds).then((names) => this.addDynamicColumns(context, selectedIds, names));
    }
    createColumnsFor(context, _id, id) {
        const selectedSubTypes = this.adapter.getSelectedSubTypes();
        return ResolveNow.resolveImmediately(this.adapter.createDescs(_id, id, selectedSubTypes)).then((descs) => {
            if (descs.length <= 0) {
                return [];
            }
            descs.forEach((d) => ABaseSelectionAdapter.patchDesc(d, _id));
            const usedCols = context.columns.filter((col) => col.desc.selectedSubtype !== undefined);
            const dynamicColumnIDs = new Set(usedCols.map((col) => `${col.desc.selectedId}_${col.desc.selectedSubtype}`));
            // Save which columns have been added for a specific element in the selection
            const selectedElements = new Set(descs.map((desc) => `${_id}_${desc.selectedSubtype}`));
            // Check which items are new and should therefore be added as columns
            const addedParameters = LineupUtils.set_diff(selectedElements, dynamicColumnIDs);
            if (addedParameters.size <= 0) {
                return [];
            }
            // Filter the descriptions to only leave the new columns and load them
            const columnsToBeAdded = descs.filter((desc) => addedParameters.has(`${_id}_${desc.selectedSubtype}`));
            const data = this.adapter.loadData(_id, id, columnsToBeAdded);
            const position = this.computePositionToInsert(context, _id);
            return columnsToBeAdded.map((desc, i) => ({ desc, data: data[i], id: _id, position }));
        });
    }
    removePartialDynamicColumns(context, ids) {
        const columns = context.columns;
        const selectedSubTypes = this.adapter.getSelectedSubTypes();
        if (selectedSubTypes.length === 0) {
            ids.forEach((id) => context.freeColor(id));
        }
        // get currently selected subtypes
        const selectedElements = new Set(selectedSubTypes);
        const usedCols = columns.filter((col) => col.desc.selectedSubtype !== undefined);
        // get available all current subtypes from lineup
        const dynamicColumnSubtypes = new Set(usedCols.map((col) => col.desc.selectedSubtype));
        // check which parameters have been removed
        const removedParameters = Array.from(LineupUtils.set_diff(dynamicColumnSubtypes, selectedElements));
        context.remove([].concat(...removedParameters.map((param) => {
            return usedCols.filter((d) => d.desc.selectedSubtype === param);
        })));
    }
    computePositionToInsert(context, id) {
        const ids = context.columns.map((col) => col.desc.selectedId);
        // find index to insert the column or append it at the end
        const lastIndex = ids.lastIndexOf(id);
        return lastIndex === -1 ? context.columns.length : lastIndex + 1;
    }
}
//# sourceMappingURL=MultiSelectionAdapter.js.map