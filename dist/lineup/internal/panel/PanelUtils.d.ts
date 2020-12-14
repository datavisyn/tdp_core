import { LocalDataProvider } from 'lineupjs';
import { EventHandler } from 'phovea_core';
export declare class LineUpOrderedRowIndicies extends EventHandler {
    private provider;
    static readonly EVENT_UPDATE_ALL = "updateAll";
    static readonly EVENT_UPDATE_SELECTED = "updateSelected";
    static readonly EVENT_UPDATE_FILTERED = "updateFiltered";
    /**
     * All row indices from the data provider.
     * Indices are not sorting (= sorting of input data)!
     */
    private all;
    /**
     * Indices of the selected rows.
     * Indices are sorted by the *first* ranking.
     */
    private selected;
    /**
     * Indices of the filtered rows.
     * Indices are sorted and filtered by the *first* ranking.
     */
    private filtered;
    constructor(provider: LocalDataProvider);
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    private addEventListener;
}
