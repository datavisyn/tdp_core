import {SearchBox, LocalDataProvider, IGroupSearchItem} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import i18n from 'phovea_core/src/i18n';
export default class SearchBoxProvider {

  private searchBoxes: SearchBox<ISearchOption>[] = [];

  constructor(private provider: LocalDataProvider, private options: any) {

  }

  get length(): number {
    return this.searchBoxes.length;
  }

  createSearchBox(): SearchBox<ISearchOption> {
    const searchBox = new SearchBox<ISearchOption>({
      placeholder: i18n.t('tdp:core.lineup.LineupPanelActions.searchPlaceholder')
    });

    searchBox.on(SearchBox.EVENT_SELECT, (item) => {
      item.action();
    });

    this.searchBoxes = [...this.searchBoxes, searchBox];

    return searchBox;
  }

  update(items: (ISearchOption | IGroupSearchItem<ISearchOption>)[]) {
    this.searchBoxes.forEach((searchBox) => searchBox.data = items);
  }
}
