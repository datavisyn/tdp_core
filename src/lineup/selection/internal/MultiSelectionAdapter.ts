import { difference, isFunction } from 'lodash';

import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
import { IContext, ISelectionColumn } from '../ISelectionAdapter';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';

export interface IMultiSelectionAdapter<T = string> {
  /**
   * Returns the list of currently selected subtypes
   * By default the generic `T` defaults to a list of strings.
   * @returns List of subtypes
   */
  getSelectedSubTypes(): T[]; // TODO rename to `getSelectedSubtypes` with lower-case `T`

  /**
   * Create the column descriptions for the given selection and subtypes
   * @param id the id
   * @param subtypes the currently selected subtypes
   * @returns the created column descs
   */
  createDescs(id: string, subtypes: T[]): Promise<IAdditionalColumnDesc[]> | IAdditionalColumnDesc[];

  /**
   * Load the data for the given selection and the selected descriptions
   * @param {string} id the id
   * @param {IAdditionalColumnDesc[]} descs list of scores to load
   * @returns {Promise<IScoreRow<any>[][]>} data
   */
  loadData(id: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];

  /**
   * Compute the difference between the subtypes from the columns in the context and
   * the selected subtypes. The returned list of subtypes is used to remove the
   * corresponding columns from the ranking.
   *
   * If this function is undefined the `MultiSelectionAdapter` uses lodash's `difference`
   * function to retrieve the list.
   *
   * @param columnSubtypes Subtypes from the columns in the ranking
   * @param selectedSubtypes Selected subtypes from `getSelectedSubTypes()`
   * @returns A list of remove subtypes
   */
  diffSubtypes?(columnSubtypes: string[], selectedSubtypes: T[]): string[];
}

export class MultiSelectionAdapter<T = string> extends ABaseSelectionAdapter {
  constructor(private readonly adapter: IMultiSelectionAdapter<T>) {
    super();
  }

  /**
   * Update columns in ranking when the parameter (e.g., subtype) of a view changes.
   * Columns are automatically removed and added to keep the columns from the context
   * and the selected subtypes in sync.
   *
   * @param context selection adapter context
   * @returns A promise to wait until all new columns have been added
   */
  protected async parameterChangedImpl(context: IContext, onContextChanged?: (context: IContext) => void | IContext): Promise<IContext | void> {
    const selectedIds = context.selection.ids;
    await this.removePartialDynamicColumns(context, selectedIds);
    await this.addDynamicColumns(context, selectedIds);

    return onContextChanged?.(context);
  }

  /**
   * Create one or multiple LineUp column descs + additional information for each selected sub-type and given id.
   *
   * @param context selection adapter context
   * @param id id for which columns should be added
   * @returns a promise that returns a list of LineUp column desc and additional information to add them to the ranking
   */
  protected async createColumnsFor(context: IContext, id: string): Promise<ISelectionColumn[]> {
    const selectedSubtypes = this.adapter.getSelectedSubTypes();

    const descs = await this.adapter.createDescs(id, selectedSubtypes);

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
  }

  private removePartialDynamicColumns(context: IContext, ids: string[]): Promise<void> {
    const { columns } = context;
    const selectedSubtypes = this.adapter.getSelectedSubTypes();
    if (selectedSubtypes.length === 0) {
      ids.forEach((id) => context.freeColor(id));
    }

    const usedCols = columns.filter((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype !== undefined);

    // get available all current subtypes from lineup
    const dynamicColumnSubtypes = usedCols.map((col) => (<IAdditionalColumnDesc>col.desc).selectedSubtype);

    // check which subtypes have been removed
    const removedSubtypes = isFunction(this.adapter.diffSubtypes)
      ? this.adapter.diffSubtypes(dynamicColumnSubtypes, selectedSubtypes)
      : difference(dynamicColumnSubtypes, selectedSubtypes as unknown as string[]); // type cast to string[] because of generic `T = string`

    const columsToRemove = removedSubtypes.map((subtype) => usedCols.filter((d) => (<IAdditionalColumnDesc>d.desc).selectedSubtype === subtype)).flat();

    return context.remove(columsToRemove);
  }

  private computePositionToInsert(context: IContext, id: string): number {
    const ids = context.columns.map((col) => (<IAdditionalColumnDesc>col.desc).selectedId);

    // find index to insert the column or append it at the end
    const lastIndex = ids.lastIndexOf(id);
    return lastIndex === -1 ? context.columns.length : lastIndex + 1;
  }
}
