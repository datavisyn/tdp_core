import { difference, isFunction } from 'lodash';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
export class MultiSelectionAdapter extends ABaseSelectionAdapter {
    constructor(adapter) {
        super();
        this.adapter = adapter;
    }
    /**
     * Update columns in ranking when the parameter (e.g., subtype) of a view changes.
     * Columns are automatically removed and added to keep the columns from the context
     * and the selected subtypes in sync.
     *
     * @param context selection adapter context
     * @returns A promise to wait until all new columns have been added
     */
    async parameterChangedImpl(context, onContextChanged) {
        const selectedIds = context.selection.ids;
        await this.removePartialDynamicColumns(context, selectedIds);
        await this.addDynamicColumns(context, selectedIds);
        onContextChanged === null || onContextChanged === void 0 ? void 0 : onContextChanged(context);
    }
    /**
     * Create one or multiple LineUp column descs + additional information for each selected sub-type and given id.
     *
     * @param context selection adapter context
     * @param id id for which columns should be added
     * @returns a promise that returns a list of LineUp column desc and additional information to add them to the ranking
     */
    async createColumnsFor(context, id) {
        const selectedSubtypes = this.adapter.getSelectedSubTypes();
        const descs = await this.adapter.createDescs(id, selectedSubtypes);
        if (descs.length <= 0) {
            return [];
        }
        descs.forEach((d) => ABaseSelectionAdapter.patchDesc(d, id));
        const usedCols = context.columns.filter((col) => col.desc.selectedSubtype !== undefined);
        const dynamicColumnIDs = usedCols.map((col) => `${col.desc.selectedId}_${col.desc.selectedSubtype}`);
        // Save which columns have been added for a specific element in the selection
        const selectedElements = descs.map((desc) => `${id}_${desc.selectedSubtype}`);
        // Check which items are new and should therefore be added as columns
        const addedParameters = difference(selectedElements, dynamicColumnIDs);
        if (addedParameters.length <= 0) {
            return [];
        }
        // Filter the descriptions to only leave the new columns and load them
        const columnsToBeAdded = descs.filter((desc) => addedParameters.includes(`${id}_${desc.selectedSubtype}`));
        const data = this.adapter.loadData(id, columnsToBeAdded);
        const position = this.computePositionToInsert(context, id);
        return columnsToBeAdded.map((desc, i) => ({ desc, data: data[i], id, position }));
    }
    removePartialDynamicColumns(context, ids) {
        const { columns } = context;
        const selectedSubtypes = this.adapter.getSelectedSubTypes();
        if (selectedSubtypes.length === 0) {
            ids.forEach((id) => context.freeColor(id));
        }
        const usedCols = columns.filter((col) => col.desc.selectedSubtype !== undefined);
        // get available all current subtypes from lineup
        const dynamicColumnSubtypes = usedCols.map((col) => col.desc.selectedSubtype);
        // check which subtypes have been removed
        const removedSubtypes = isFunction(this.adapter.diffSubtypes)
            ? this.adapter.diffSubtypes(dynamicColumnSubtypes, selectedSubtypes)
            : difference(dynamicColumnSubtypes, selectedSubtypes); // type cast to string[] because of generic `T = string`
        const columsToRemove = removedSubtypes.map((subtype) => usedCols.filter((d) => d.desc.selectedSubtype === subtype)).flat();
        return context.remove(columsToRemove);
    }
    computePositionToInsert(context, id) {
        const ids = context.columns.map((col) => col.desc.selectedId);
        // find index to insert the column or append it at the end
        const lastIndex = ids.lastIndexOf(id);
        return lastIndex === -1 ? context.columns.length : lastIndex + 1;
    }
}
//# sourceMappingURL=MultiSelectionAdapter.js.map