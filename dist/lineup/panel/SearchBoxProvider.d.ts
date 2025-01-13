import { IGroupSearchItem, ISearchBoxOptions, SearchBox } from 'lineupjs';
import { ISearchOption } from './ISearchOption';
/**
 * The SearchBoxProvider allows creating multiple LineUp SearchBoxes and stores them internally in a list.
 * All created search boxes can be updated simultaneously with a list of searchable items.
 */
export declare class SearchBoxProvider {
    /**
     * List of created LineUp SearchBoxes
     */
    private searchBoxes;
    get length(): number;
    /**
     * Create a new LineUp SearchBox. The instance is added to the internal list and returned.
     * @returns A new LineUp SearchBox instance
     */
    createSearchBox(options?: Partial<ISearchBoxOptions<ISearchOption>>): SearchBox<ISearchOption>;
    /**
     * Set the passed items to all previously created search box instances.
     * @param items List of searchable items for the SearchBox
     */
    update(items: (ISearchOption | IGroupSearchItem<ISearchOption>)[]): void;
}
//# sourceMappingURL=SearchBoxProvider.d.ts.map