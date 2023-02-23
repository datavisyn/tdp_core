import { SearchBox } from 'lineupjs';
import { I18nextManager } from 'visyn_core';
/**
 * The SearchBoxProvider allows creating multiple LineUp SearchBoxes and stores them internally in a list.
 * All created search boxes can be updated simultaneously with a list of searchable items.
 */
export class SearchBoxProvider {
    constructor() {
        /**
         * List of created LineUp SearchBoxes
         */
        this.searchBoxes = [];
    }
    get length() {
        return this.searchBoxes.length;
    }
    /**
     * Create a new LineUp SearchBox. The instance is added to the internal list and returned.
     * @returns A new LineUp SearchBox instance
     */
    createSearchBox(options = {}) {
        const mergedOptions = { placeholder: I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.searchPlaceholder'), ...options };
        const searchBox = new SearchBox(mergedOptions);
        searchBox.on(SearchBox.EVENT_SELECT, (item) => {
            item.action();
        });
        this.searchBoxes = [...this.searchBoxes, searchBox];
        return searchBox;
    }
    /**
     * Set the passed items to all previously created search box instances.
     * @param items List of searchable items for the SearchBox
     */
    update(items) {
        this.searchBoxes.forEach((searchBox) => (searchBox.data = items));
    }
}
//# sourceMappingURL=SearchBoxProvider.js.map