import { EDirtyReason, LocalDataProvider, Ranking } from 'lineupjs';
import { EventHandler } from 'visyn_core';
/**
 *  Store the ordered row indices for all, selected or filtered rows of the first ranking.
 */
class LineUpOrderedRowIndicies extends EventHandler {
    constructor(provider) {
        super();
        /**
         * All row indices from the data provider.
         * Indices are not sorting (= sorting of input data)!
         */
        this._all = [];
        /**
         * Indices of the selected rows.
         * Indices are sorted by the *first* ranking.
         */
        this._selected = [];
        /**
         * Indices of the filtered rows.
         * Indices are sorted and filtered by the *first* ranking.
         */
        this._filtered = [];
        this.addEventListener(provider);
    }
    /**
     * All row indices from the data provider.
     * Indices are not sorting (= sorting of input data)!
     */
    get all() {
        return this._all;
    }
    /**
     * Indices of the selected rows.
     * Indices are sorted by the *first* ranking.
     */
    get selected() {
        return this._selected;
    }
    /**
     * Indices of the filtered rows.
     * Indices are sorted and filtered by the *first* ranking.
     */
    get filtered() {
        return this._filtered;
    }
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    addEventListener(provider) {
        const eventSuffix = '.panel-utils';
        provider.on(LocalDataProvider.EVENT_DATA_CHANGED + eventSuffix, (rows) => {
            this._all = rows.map((d) => d.i);
            this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_ALL, this._all);
        });
        provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + eventSuffix, (_indices) => {
            // NOTE: the `indices` does not reflect the sorting of the (first) ranking, instead the ids are always ordered ascending
            if (provider.getFirstRanking() != null) {
                const order = Array.from(provider.getFirstRanking().getOrder()); // use order of the first ranking
                this._selected = this.sortValues(provider.getSelection(), Object.fromEntries(order.map((o, i) => [o, i])));
                this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED, this._selected);
            }
        });
        // wait until (first) ranking is added to data provider
        provider.on(LocalDataProvider.EVENT_ADD_RANKING, (_ranking, index) => {
            // TODO: implement support for multiple rankings; currently, only the first ranking is supported
            if (index > 0 || !provider.getFirstRanking()) {
                return;
            }
            provider
                .getFirstRanking()
                .on(Ranking.EVENT_ORDER_CHANGED + eventSuffix, (_previous, current, _previousGroups, _currentGroups, dirtyReason) => {
                // update filtered rows on filter and sort events
                if (dirtyReason.indexOf(EDirtyReason.FILTER_CHANGED) > -1 || dirtyReason.indexOf(EDirtyReason.SORT_CRITERIA_CHANGED) > -1) {
                    // no rows are filtered -> reset array
                    if (current.length === this._all.length) {
                        this._filtered = [];
                        // some rows are filtered
                    }
                    else {
                        // NOTE: `current` contains always the *sorted* and *filtered* row indices of the (first) ranking!
                        this._filtered =
                            current instanceof Uint8Array || current instanceof Uint16Array || current instanceof Uint32Array ? Array.from(current) : current; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
                    }
                    this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_FILTERED, this._filtered);
                }
                // update sorting of selected rows
                if (dirtyReason.indexOf(EDirtyReason.SORT_CRITERIA_CHANGED) > -1) {
                    const order = Array.from(provider.getFirstRanking().getOrder()); // use order of the first ranking
                    this._selected = this.sortValues(provider.getSelection(), Object.fromEntries(order.map((o, i) => [o, i])));
                    this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED, this._selected);
                }
            });
        });
        provider.on(LocalDataProvider.EVENT_REMOVE_RANKING, (_ranking, index) => {
            // TODO: implement support for multiple rankings; currently, only the first ranking is supported
            if (index > 0 || !provider.getFirstRanking()) {
                return;
            }
            provider.getFirstRanking().on(Ranking.EVENT_ORDER_CHANGED + eventSuffix, null);
        });
    }
    sortValues(values, order) {
        return values.sort((a, b) => {
            const aIndex = order[a];
            const bIndex = order[b];
            return (aIndex > -1 ? aIndex : Infinity) - (bIndex > -1 ? bIndex : Infinity); // sort missing values in the order array to the end
        });
    }
}
LineUpOrderedRowIndicies.EVENT_UPDATE_ALL = 'updateAll';
LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED = 'updateSelected';
LineUpOrderedRowIndicies.EVENT_UPDATE_FILTERED = 'updateFiltered';
export { LineUpOrderedRowIndicies };
//# sourceMappingURL=LineUpOrderedRowIndicies.js.map