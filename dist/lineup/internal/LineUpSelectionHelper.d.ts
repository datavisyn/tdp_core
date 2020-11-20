/**
 * Created by sam on 13.02.2017.
 */
import { ISelection } from '../../base';
import { EventHandler, IDType, Range } from 'phovea_core';
import { IRow } from '../../base/rest';
import { LocalDataProvider } from 'lineupjs';
export declare class LineUpSelectionHelper extends EventHandler {
    private readonly provider;
    private readonly idType;
    static readonly EVENT_SET_ITEM_SELECTION = "setItemSelection";
    private _rows;
    /**
     * selected indices ordered by selection order, i.e. the first selected is the 0. item
     * @type {number[]}
     */
    private readonly orderedSelectedIndices;
    private uid2index;
    constructor(provider: LocalDataProvider, idType: () => IDType);
    private buildCache;
    private addEventListener;
    private removeEventListener;
    private onMultiSelectionChanged;
    set rows(rows: IRow[]);
    get rows(): IRow[];
    /**
     * gets the rows ids as a set, i.e. the order doesn't mean anything
     */
    rowIdsAsSet(indices: number[]): Range;
    setItemSelection(sel: ISelection): void;
}
