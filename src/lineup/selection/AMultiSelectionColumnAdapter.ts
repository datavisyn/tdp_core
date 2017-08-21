/**
 * Created by Samuel Gratzl on 29.01.2016.
 */
import {IContext, ISelectionAdapter} from './ISelectionAdapter';
import {IAdditionalColumnDesc} from '../desc';
import {set_diff} from '../internal/LineUpSelectionHelper';
import {IScoreRow} from '../IScore';
import {ABaseSelectionColumnAdapter} from './internal/ABaseSelectionColumnAdapter';

export abstract class AMultiSelectionColumnAdapter extends ABaseSelectionColumnAdapter implements ISelectionAdapter {
  parameterChanged(context: IContext) {
    const selectedIds = context.selection.range.dim(0).asList();
    this.addDynamicColumns(context, selectedIds);
    this.removePartialDynamicColumns(context, selectedIds);
  }

  protected createColumnsFor(context: IContext, id: number) {
    const selectedSubTypes = this.getSelectedSubTypes();
    return this.createDescs(context, id, selectedSubTypes).then((descs) => {
      if (descs.length <= 0) {
        return [];
      }
      const usedCols = context.columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);
      const dynamicColumnIDs = new Set<string>(usedCols.map((col) => `${(<IAdditionalColumnDesc>col.desc).selectedId}_${(<IAdditionalColumnDesc>col.desc).selectedSubtype}`));
      // Save which columns have been added for a specific element in the selection
      const selectedElements = new Set<string>(descs.map((desc) => `${id}_${desc.selectedSubtype}`));

      // Check which items are new and should therefore be added as columns
      const addedParameters = set_diff(selectedElements, dynamicColumnIDs);

      if (addedParameters.size <= 0) {
        return;
      }
      // Filter the descriptions to only leave the new columns and load them
      const columnsToBeAdded = descs.filter((desc) => addedParameters.has(`${id}_${desc.selectedSubtype}`));
      const data = this.loadData(context, id, columnsToBeAdded);

      return columnsToBeAdded.map((desc, i) => ({desc, data: data.then((d) => d[i]), id}));
    });
  }

  private removePartialDynamicColumns(context: IContext, ids: number[]): void {
    const columns = context.columns;
    const selectedSubTypes = this.getSelectedSubTypes();
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

  protected abstract createDescs(context: IContext, id: number, subTypes: string[]): Promise<IAdditionalColumnDesc[]>;

  protected abstract getSelectedSubTypes(): string[];

  protected abstract loadData(context: IContext, id: number, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[][]>;
}

export default AMultiSelectionColumnAdapter;
