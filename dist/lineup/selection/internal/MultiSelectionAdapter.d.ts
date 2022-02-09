import { IContext } from '../ISelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
export interface IMultiSelectionAdapter {
    /**
     * returns the list of currently selected sub types
     * @returns {string[]}
     */
    getSelectedSubTypes(): string[];
    /**
     * create the column descriptions for the given selection and sub types
     * @param {string} id the id
     * @param {string[]} subTypes the currently selected sub types
     * @returns {Promise<IAdditionalColumnDesc[]>} the created descriptions
     */
    createDescs(id: string, subTypes: string[]): Promise<IAdditionalColumnDesc[]> | IAdditionalColumnDesc[];
    /**
     * load the data for the given selection and the selected descriptions
     * @param {string} id the id
     * @param {IAdditionalColumnDesc[]} descs list of scores to load
     * @returns {Promise<IScoreRow<any>[][]>} data
     */
    loadData(id: string, descs: IAdditionalColumnDesc[]): Promise<IScoreRow<any>[]>[];
}
export declare class MultiSelectionAdapter extends ABaseSelectionAdapter {
    private readonly adapter;
    constructor(adapter: IMultiSelectionAdapter);
    protected parameterChangedImpl(context: IContext): Promise<void>;
    protected createColumnsFor(context: IContext, id: string): PromiseLike<{
        desc: IAdditionalColumnDesc;
        data: Promise<IScoreRow<any>[]>;
        id: string;
        position: number;
    }[]>;
    private removePartialDynamicColumns;
    private computePositionToInsert;
}
//# sourceMappingURL=MultiSelectionAdapter.d.ts.map