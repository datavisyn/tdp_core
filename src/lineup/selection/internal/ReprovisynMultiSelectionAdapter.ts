import { difference } from 'lodash';
import { IContext } from '../ISelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';

export interface IReprovisynMultiSelectionAdapter {
  /**
   * returns the list of currently selected sub types
   * @returns {string[]}
   */
  getSelectedSubTypes(): { entityId: string; columnSelection: string }[];

  /**
   * create the column descriptions for the given selection and sub types
   * @param {string} id the id
   * @param {string[]} subTypes the currently selected sub types
   * @returns {Promise<IAdditionalColumnDesc[]>} the created descriptions
   */
  createDescs(id: string, subTypes: { entityId: string; columnSelection: string }[]): Promise<IAdditionalColumnDesc[]> | IAdditionalColumnDesc[];

  /**
   * load the data for the given selection and the selected descriptions
   * @param {string} id the id
   * @param {IAdditionalColumnDesc[]} descs list of scores to load
   * @returns {Promise<IScoreRow<any>[][]>} data
   */
  loadData(id: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];
}

export class ReprovisynMultiSelectionAdapter extends ABaseSelectionAdapter {
  constructor(private readonly adapter: IReprovisynMultiSelectionAdapter) {
    super();
  }

  protected parameterChangedImpl(context: IContext) {
    const selectedIds = context.selection.ids;
    this.removePartialDynamicColumns(context, selectedIds);
    return this.addDynamicColumns(context, selectedIds);
  }

  protected createColumnsFor(context: IContext, id: string) {
    return Promise.resolve(this.adapter.createDescs(id, this.adapter.getSelectedSubTypes())).then((descs) => {
      if (descs.length <= 0) {
        return [];
      }
      descs.forEach((d) => ABaseSelectionAdapter.patchDesc(d, id));

      const usedCols = context.columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);
      const dynamicColumnIDs = usedCols.map((col) => `${(<IAdditionalColumnDesc>col.desc).selectedId}_${(<IAdditionalColumnDesc>col.desc).selectedSubtype}`);
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
    });
  }

  private removePartialDynamicColumns(context: IContext, ids: string[]): void {
    const { columns } = context;
    const selectedSubTypes = this.adapter.getSelectedSubTypes();
    if (selectedSubTypes.length === 0) {
      ids.forEach((id) => context.freeColor(id));
    }

    const usedCols = columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);

    // get available all current subtypes from lineup
    const dynamicColumnSubtypes = usedCols.map((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype);

    // check which parameters have been removed
    const removedParameters = difference(
      dynamicColumnSubtypes,
      selectedSubTypes.map((s) => s.columnSelection),
    );

    context.remove(
      [].concat(
        ...removedParameters.map((param) => {
          return usedCols.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedSubtype === param);
        }),
      ),
    );
  }

  private computePositionToInsert(context: IContext, id: string) {
    const ids = context.columns.map((col) => (<IAdditionalColumnDesc>col.desc).selectedId);

    // find index to insert the column or append it at the end
    const lastIndex = ids.lastIndexOf(id);
    return lastIndex === -1 ? context.columns.length : lastIndex + 1;
  }
}
