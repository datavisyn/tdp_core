import { difference } from 'lodash';
import { IContext, ISelectionAdapter } from '../ISelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { ResolveNow } from '../../../base';

export interface IMultiSelectionAdapter {
  /**
   * returns the list of currently selected sub types
   * @returns {string[]}
   */
  getSelectedSubTypes(): string[];

  /**
   * create the column descriptions for the given selection and sub types
   * @param {number} _id the internal unique number
   * @param {string} id the associated name of the unique id
   * @param {string[]} subTypes the currently selected sub types
   * @returns {Promise<IAdditionalColumnDesc[]>} the created descriptions
   */
  createDescs(_id: number, id: string, subTypes: string[]): Promise<IAdditionalColumnDesc[]> | IAdditionalColumnDesc[];

  /**
   * load the data for the given selection and the selected descriptions
   * @param {number} _id the internal unique number
   * @param {string} id the associated name of the unique id
   * @param {IAdditionalColumnDesc[]} descs list of scores to load
   * @returns {Promise<IScoreRow<any>[][]>} data
   */
  loadData(_id: number, id: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];
}

export class MultiSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
  constructor(private readonly adapter: IMultiSelectionAdapter) {
    super();
  }

  protected parameterChangedImpl(context: IContext) {
    const selectedIds = context.selection.range.dim(0).asList();
    this.removePartialDynamicColumns(context, selectedIds);
    return context.selection.idtype.unmap(selectedIds).then((names) => this.addDynamicColumns(context, selectedIds, names));
  }

  protected createColumnsFor(context: IContext, _id: number, id: string) {
    const selectedSubTypes = this.adapter.getSelectedSubTypes();
    return ResolveNow.resolveImmediately(this.adapter.createDescs(_id, id, selectedSubTypes)).then((descs) => {
      if (descs.length <= 0) {
        return [];
      }
      descs.forEach((d) => ABaseSelectionAdapter.patchDesc(d, _id));

      const usedCols = context.columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);
      const dynamicColumnIDs = usedCols.map((col) => `${(<IAdditionalColumnDesc>col.desc).selectedId}_${(<IAdditionalColumnDesc>col.desc).selectedSubtype}`);
      // Save which columns have been added for a specific element in the selection
      const selectedElements = descs.map((desc) => `${_id}_${desc.selectedSubtype}`);

      // Check which items are new and should therefore be added as columns
      const addedParameters = difference(selectedElements, dynamicColumnIDs);

      if (addedParameters.length <= 0) {
        return [];
      }
      // Filter the descriptions to only leave the new columns and load them
      const columnsToBeAdded = descs.filter((desc) => addedParameters.indexOf(`${_id}_${desc.selectedSubtype}`) > -1);
      const data = this.adapter.loadData(_id, id, columnsToBeAdded);

      const position = this.computePositionToInsert(context, _id);

      return columnsToBeAdded.map((desc, i) => ({ desc, data: data[i], id: _id, position }));
    });
  }

  private removePartialDynamicColumns(context: IContext, ids: number[]): void {
    const { columns } = context;
    const selectedSubTypes = this.adapter.getSelectedSubTypes();
    if (selectedSubTypes.length === 0) {
      ids.forEach((id) => context.freeColor(id));
    }

    const usedCols = columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);

    // get available all current subtypes from lineup
    const dynamicColumnSubtypes = usedCols.map((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype);

    // check which parameters have been removed
    const removedParameters = difference(dynamicColumnSubtypes, selectedSubTypes);

    context.remove(
      [].concat(
        ...removedParameters.map((param) => {
          return usedCols.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedSubtype === param);
        }),
      ),
    );
  }

  private computePositionToInsert(context: IContext, id: number) {
    const ids = context.columns.map((col) => (<IAdditionalColumnDesc>col.desc).selectedId);

    // find index to insert the column or append it at the end
    const lastIndex = ids.lastIndexOf(id);
    return lastIndex === -1 ? context.columns.length : lastIndex + 1;
  }
}
