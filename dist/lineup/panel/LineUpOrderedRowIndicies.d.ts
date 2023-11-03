import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from 'visyn_core/base';
/**
 *  Store the ordered row indices for all, selected or filtered rows of the first ranking.
 */
export declare class LineUpOrderedRowIndicies extends EventHandler {
    static readonly EVENT_UPDATE_ALL = "updateAll";
    static readonly EVENT_UPDATE_SELECTED = "updateSelected";
    static readonly EVENT_UPDATE_FILTERED = "updateFiltered";
    /**
     * All row indices from the data provider.
     * Indices are not sorting (= sorting of input data)!
     */
    private _all;
    /**
     * Indices of the selected rows.
     * Indices are sorted by the *first* ranking.
     */
    private _selected;
    /**
     * Indices of the filtered rows.
     * Indices are sorted and filtered by the *first* ranking.
     */
    private _filtered;
    constructor(provider: LocalDataProvider);
    /**
     * All row indices from the data provider.
     * Indices are not sorting (= sorting of input data)!
     */
    get all(): number[];
    /**
     * Indices of the selected rows.
     * Indices are sorted by the *first* ranking.
     */
    get selected(): number[];
    /**
     * Indices of the filtered rows.
     * Indices are sorted and filtered by the *first* ranking.
     */
    get filtered(): number[];
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    private addEventListener;
    private sortValues;
}
//# sourceMappingURL=LineUpOrderedRowIndicies.d.ts.map