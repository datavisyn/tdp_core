import {SearchBox, LocalDataProvider, IGroupSearchItem, ISearchBoxOptions} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import i18n from 'phovea_core/src/i18n';

/**
 * The SearchBoxProvider allows creating multiple LineUp SearchBoxes and stores them internally in a list.
 * All created search boxes can be updated simultaneously with a list of searchable items.
 */
export default class SearchBoxProvider {

  /**
   * List of created LineUp SearchBoxes
   */
  private searchBoxes: SearchBox<ISearchOption>[] = [];

  get length(): number {
    return this.searchBoxes.length;
  }

  /**
   * Create a new LineUp SearchBox. The instance is added to the internal list and returned.
   * @returns A new LineUp SearchBox instance
   */
  createSearchBox(options: Partial<ISearchBoxOptions<ISearchOption>> = {}): SearchBox<ISearchOption> {
    const mergedOptions = Object.assign({
      placeholder: i18n.t('tdp:core.lineup.LineupPanelActions.searchPlaceholder')
    }, options);

    const searchBox = new SearchBox<ISearchOption>(mergedOptions);

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
  update(items: (ISearchOption | IGroupSearchItem<ISearchOption>)[]) {
    this.searchBoxes.forEach((searchBox) => searchBox.data = items);
  }

}
