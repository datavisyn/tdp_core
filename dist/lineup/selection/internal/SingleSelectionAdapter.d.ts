import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { IContext } from '../ISelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
export interface ISingleSelectionAdapter {
    /**
     * create the column description for the given selection
     * @param {string} id the id
     * @returns {Promise<IAdditionalColumnDesc>} the created description
     */
    createDesc(id: string): Promise<IAdditionalColumnDesc> | IAdditionalColumnDesc;
    /**
     * loads the score data for the given selection
     * @param {string} id the id
     * @returns {Promise<IScoreRow<any>[]>} data
     */
    loadData(id: string): Promise<IScoreRow<any>[]>;
}
export declare class SingleSelectionAdapter extends ABaseSelectionAdapter {
    private readonly adapter;
    constructor(adapter: ISingleSelectionAdapter);
    protected parameterChangedImpl(context: IContext): Promise<void>;
    protected createColumnsFor(context: IContext, id: string): Promise<{
        desc: IAdditionalColumnDesc;
        data: Promise<IScoreRow<any>[]>;
        id: string;
    }[]>;
}
//# sourceMappingURL=SingleSelectionAdapter.d.ts.map