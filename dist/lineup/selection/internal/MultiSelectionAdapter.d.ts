import { IContext, ISelectionColumn } from '../ISelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
export interface IMultiSelectionAdapter<T = string> {
    /**
     * Returns the list of currently selected subtypes
     * By default the generic `T` defaults to a list of strings.
     * @returns List of subtypes
     */
    getSelectedSubTypes(): T[];
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
export declare class MultiSelectionAdapter<T = string> extends ABaseSelectionAdapter {
    private readonly adapter;
    constructor(adapter: IMultiSelectionAdapter<T>);
    /**
     * Update columns in ranking when the parameter (e.g., subtype) of a view changes.
     * Columns are automatically removed and added to keep the columns from the context
     * and the selected subtypes in sync.
     *
     * @param context selection adapter context
     * @returns A promise to wait until all new columns have been added
     */
    protected parameterChangedImpl(context: IContext, onContextChanged?: (context: IContext) => void): Promise<void>;
    /**
     * Create one or multiple LineUp column descs + additional information for each selected sub-type and given id.
     *
     * @param context selection adapter context
     * @param id id for which columns should be added
     * @returns a promise that returns a list of LineUp column desc and additional information to add them to the ranking
     */
    protected createColumnsFor(context: IContext, id: string): Promise<ISelectionColumn[]>;
    private removePartialDynamicColumns;
    private computePositionToInsert;
}
//# sourceMappingURL=MultiSelectionAdapter.d.ts.map