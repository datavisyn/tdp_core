import { LocalDataProvider } from 'lineupjs';
import { EventHandler, IRow } from 'visyn_core/base';
import { IDType } from 'visyn_core/idtype';
import { ISelection } from '../../base';
export declare class LineUpSelectionHelper extends EventHandler {
    private readonly provider;
    private readonly idType;
    static readonly EVENT_SET_ITEM_SELECTION = "setItemSelection";
    private _rows;
    private idField;
    /**
     * selected indices ordered by selection order, i.e. the first selected is the 0. item
     * @type {number[]}
     */
    private readonly orderedSelectedIndices;
    private uid2index;
    constructor(provider: LocalDataProvider, idType: () => IDType, { idField, }?: {
        idField?: string;
    });
    private buildCache;
    private addEventListener;
    private removeEventListener;
    private onMultiSelectionChanged;
    set rows(rows: IRow[]);
    get rows(): IRow[];
    /**
     * gets the rows ids as a set, i.e. the order doesn't mean anything
     */
    rowIdsAsSet(indices: number[]): string[];
    setItemSelection(sel: ISelection): void;
    setGeneralVisSelection(sel: ISelection): void;
}
//# sourceMappingURL=LineUpSelectionHelper.d.ts.map