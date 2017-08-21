/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {IContext, ISelectionAdapter} from '../ISelectionAdapter';
import {IAdditionalColumnDesc} from '../../desc';
import {set_diff} from '../../internal/LineUpSelectionHelper';
import {IScoreRow} from '../../IScore';
import {ABaseSelectionAdapter} from './ABaseSelectionAdapter';

export interface IMultiSelectionAdapter {
  createDescs(_id: number, id: string, subTypes: string[]): Promise<IAdditionalColumnDesc[]>;

  getSelectedSubTypes(): string[];

  loadData(_id: number, id: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[][]>;
}

export default class MultiSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
  constructor(private readonly adapter: IMultiSelectionAdapter) {
    super();
  }
  parameterChanged(context: IContext) {
    const selectedIds = context.selection.range.dim(0).asList();
    this.removePartialDynamicColumns(context, selectedIds);
    context.selection.idtype.unmap(selectedIds).then((names) => this.addDynamicColumns(context, selectedIds, names));
  }

  protected createColumnsFor(context: IContext, _id: number, id: string) {
    const selectedSubTypes = this.adapter.getSelectedSubTypes();
    return this.adapter.createDescs(_id, id, selectedSubTypes).then((descs) => {
      if (descs.length <= 0) {
        return [];
      }
      const usedCols = context.columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);
      const dynamicColumnIDs = new Set<string>(usedCols.map((col) => `${(<IAdditionalColumnDesc>col.desc).selectedId}_${(<IAdditionalColumnDesc>col.desc).selectedSubtype}`));
      // Save which columns have been added for a specific element in the selection
      const selectedElements = new Set<string>(descs.map((desc) => `${_id}_${desc.selectedSubtype}`));

      // Check which items are new and should therefore be added as columns
      const addedParameters = set_diff(selectedElements, dynamicColumnIDs);

      if (addedParameters.size <= 0) {
        return;
      }
      // Filter the descriptions to only leave the new columns and load them
      const columnsToBeAdded = descs.filter((desc) => addedParameters.has(`${_id}_${desc.selectedSubtype}`));
      const data = this.adapter.loadData(_id, id, columnsToBeAdded);

      return columnsToBeAdded.map((desc, i) => ({desc, data: data.then((d) => d[i]), id: _id}));
    });
  }

  private removePartialDynamicColumns(context: IContext, ids: number[]): void {
    const columns = context.columns;
    const selectedSubTypes = this.adapter.getSelectedSubTypes();
    if (selectedSubTypes.length === 0) {
      ids.forEach((id) => context.freeColor(id));
    }
    // get currently selected subtypes
    const selectedElements = new Set<string>(selectedSubTypes);

    const usedCols = columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);

    // get available all current subtypes from lineup
    const dynamicColumnSubtypes = new Set<string>(usedCols.map((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype));

    // check which parameters have been removed
    const removedParameters = Array.from(set_diff(dynamicColumnSubtypes, selectedElements));

    context.remove([].concat(...removedParameters.map((param) => {
      return usedCols.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedSubtype === param);
    })));
  }
}
