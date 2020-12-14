import { EDirtyReason, LocalDataProvider, Ranking } from 'lineupjs';
import { EventHandler } from 'phovea_core';
export class LineUpOrderedRowIndicies extends EventHandler {
    constructor(provider) {
        super();
        this.provider = provider;
        /**
         * All row indices from the data provider.
         * Indices are not sorting (= sorting of input data)!
         */
        this.all = [];
        /**
         * Indices of the selected rows.
         * Indices are sorted by the *first* ranking.
         */
        this.selected = [];
        /**
         * Indices of the filtered rows.
         * Indices are sorted and filtered by the *first* ranking.
         */
        this.filtered = [];
        this.addEventListener();
    }
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    addEventListener() {
        const eventSuffix = '.panel-utils';
        this.provider.on(LocalDataProvider.EVENT_DATA_CHANGED + eventSuffix, (rows) => {
            this.all = rows.map((d) => d.i);
            this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_ALL, this.all);
        });
        this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + eventSuffix, (_indices) => {
            // NOTE: the `indices` does not reflect the sorting of the (first) ranking, instead the ids are always ordered ascending
            const order = Array.from(this.provider.getFirstRanking().getOrder()); // use order of the first ranking
            this.selected = this.provider.getSelection()
                .sort((a, b) => {
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                return (aIndex > -1 ? aIndex : Infinity) - (bIndex > -1 ? bIndex : Infinity); // sort missing values in the order array to the end
            });
            this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED, this.selected);
        });
        // wait until (first) ranking is added to data provider
        this.provider.on(LocalDataProvider.EVENT_ADD_RANKING, (_ranking, _index) => {
            // TODO: implement support for multiple rankings; currently, only the first ranking is supported
            this.provider.getFirstRanking().on(Ranking.EVENT_ORDER_CHANGED + eventSuffix, (_previous, current, _previousGroups, _currentGroups, dirtyReason) => {
                // update filtered rows on filter and sort events
                if (dirtyReason.indexOf(EDirtyReason.FILTER_CHANGED) > -1 || dirtyReason.indexOf(EDirtyReason.SORT_CRITERIA_CHANGED) > -1) {
                    // no rows are filtered -> reset array
                    if (current.length === this.all.length) {
                        this.filtered = [];
                        // some rows are filtered
                    }
                    else {
                        // NOTE: `current` contains always the *sorted* and *filtered* row indices of the (first) ranking!
                        this.filtered = (current instanceof Uint8Array || current instanceof Uint16Array || current instanceof Uint32Array) ? Array.from(current) : current; // convert UIntTypedArray if necessary -> TODO: https://github.com/datavisyn/tdp_core/issues/412
                    }
                    this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_FILTERED, this.filtered);
                }
                // update sorting of selected rows
                if (dirtyReason.indexOf(EDirtyReason.SORT_CRITERIA_CHANGED) > -1) {
                    const order = this.provider.getFirstRanking().getOrder(); // use order of the first ranking
                    this.selected = this.provider.getSelection()
                        .sort((a, b) => {
                        const aIndex = order.indexOf(a);
                        const bIndex = order.indexOf(b);
                        return (aIndex > -1 ? aIndex : Infinity) - (bIndex > -1 ? bIndex : Infinity); // sort missing values in the order array to the end
                    });
                    this.fire(LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED, this.selected);
                }
            });
        });
        this.provider.on(LocalDataProvider.EVENT_REMOVE_RANKING, (_ranking, _index) => {
            // TODO: implement support for multiple rankings; currently, only the first ranking is supported
            this.provider.getFirstRanking().on(Ranking.EVENT_ORDER_CHANGED + eventSuffix, null);
        });
    }
}
LineUpOrderedRowIndicies.EVENT_UPDATE_ALL = 'updateAll';
LineUpOrderedRowIndicies.EVENT_UPDATE_SELECTED = 'updateSelected';
LineUpOrderedRowIndicies.EVENT_UPDATE_FILTERED = 'updateFiltered';
//# sourceMappingURL=PanelUtils.js.map