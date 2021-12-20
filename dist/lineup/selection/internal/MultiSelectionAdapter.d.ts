import { IContext, ISelectionAdapter } from '../ISelectionAdapter';
import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { IScoreRow } from '../../../base/interfaces';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
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
    /**
     * Limit the columns incoming selections considered when adding
     * a column in the dependent ranking
     */
    selectionLimit?: number;
}
export declare class MultiSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
    protected readonly adapter: IMultiSelectionAdapter;
    constructor(adapter: IMultiSelectionAdapter);
    protected parameterChangedImpl(context: IContext): Promise<void>;
    protected createColumnsFor(context: IContext, _id: number, id: string): PromiseLike<{
        desc: IAdditionalColumnDesc;
        data: Promise<IScoreRow<any>[]>;
        id: number;
        position: number;
    }[]>;
    private removePartialDynamicColumns;
    private computePositionToInsert;
}
