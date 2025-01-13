import { ABaseSelectionAdapter } from './ABaseSelectionAdapter';
import { IAdditionalColumnDesc, IScoreRow } from '../../../base/interfaces';
import { IContext, ISelectionColumn } from '../ISelectionAdapter';
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
    /**
     * Creates a single column desc with additional metadata for a given selected id.
     *
     * @param context selection adapter context
     * @param id id of the selected item
     * @returns A promise with a list containing a single columns + additional metadata
     */
    protected createColumnsFor(_context: IContext, id: string): Promise<ISelectionColumn[]>;
}
//# sourceMappingURL=SingleSelectionAdapter.d.ts.map