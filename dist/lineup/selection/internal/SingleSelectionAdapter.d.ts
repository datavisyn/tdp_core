import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { IContext, ISelectionAdapter } from '../ISelectionAdapter';
import { IAdditionalColumnDesc } from '../../../base/interfaces';
import { IScoreRow } from '../../../base/interfaces';
export interface ISingleSelectionAdapter {
    /**
     * create the column description for the given selection
     * @param {number} _id the internal unique number
     * @param {string} id the associated name of the unique id
     * @returns {Promise<IAdditionalColumnDesc>} the created description
     */
    createDesc(_id: number, id: string): Promise<IAdditionalColumnDesc> | IAdditionalColumnDesc;
    /**
     * loads the score data for the given selection
     * @param {number} _id the internal unique number
     * @param {string} id the associated name of the unique id
     * @returns {Promise<IScoreRow<any>[]>} data
     */
    loadData(_id: number, id: string): Promise<IScoreRow<any>[]>;
    /**
     * Limit incoming selections considered when adding
     * a column in the dependent ranking.
     */
    selectionLimit?: number;
}
export declare class SingleSelectionAdapter extends ABaseSelectionAdapter implements ISelectionAdapter {
    protected readonly adapter: ISingleSelectionAdapter;
    constructor(adapter: ISingleSelectionAdapter);
    protected parameterChangedImpl(context: IContext): Promise<void>;
    protected createColumnsFor(context: IContext, _id: number, id: string): PromiseLike<{
        desc: IAdditionalColumnDesc;
        data: Promise<IScoreRow<any>[]>;
        id: number;
    }[]>;
}
