import {LocalDataProvider, IColumnDesc, ICategory, Column, Ranking, IDataRow} from 'lineupjs';
import {isProxyAccessor} from '../utils';
import {IServerColumn} from '../../../rest';


export interface IAttributeCategory extends ICategory {
  attribute: IServerColumn;
}

export class RankingAdapter {
  static readonly RANK_COLUMN_ID = 'rank';
  static readonly SELECTION_COLUMN_ID = 'selection';
  static readonly GROUP_COLUMN_ID = 'group_hierarchy';

  getRowsWithCategory(attrCategory: IAttributeCategory): number[] {
    const indices = [];

    const attrData = this.getAttributeDataDisplayed(attrCategory.attribute.column);
    for (const [rowIndex, rowData] of attrData.entries()) {
      if (rowData === attrCategory.name) {
        indices.push(rowIndex);
      }
    }
    return indices;
  }

  constructor(protected readonly provider: LocalDataProvider, private rankingIndex = 0) {  }

  public getProvider(): LocalDataProvider {
    return this.provider;
  }


  private getScoreColumns() {
    return this.getDisplayedAttributes().filter((attr) => (attr.desc as any)._score);
  }


  private oldOrder: Array<number> = new Array();
  private oldSelection : Array<number> = new Array();
  private oldAttributes: Array<Column> = new Array();
  private data: Array<any>;

  /**
   * Return an array of displayed items, with their id and data (including selection status and rank).
   *  Data Template:
   *    [{
   *      _id: 123,
   *      rank: 0,
   *      selection: 'Selected,
   *      attr1: 3.14159
   *    },
   *    ...
   *    ]
   */
  public getItemsDisplayed(sort = true): Array<Object> {
    const allItems = this.getItems();
    // get currently displayed data
    return this.getItemOrder().map((rowId) => allItems[rowId]);
  }


  public getItems(): Array<Object> {
    // if the attributes are the same, we can reuse the data array
    // if the selection

    // TODO events may be better?
    const sameAttr = this.oldAttributes.length === this.getDisplayedAttributes().length && this.oldAttributes.filter((attr) => /*note the negation*/ !this.getDisplayedAttributes().some((attr2) => attr2.desc.label === attr.desc.label)).length === 0;
    const sameSel = this.oldSelection.length === this.getSelectionUnsorted().length && this.oldSelection.every((val, i) => this.getSelectionUnsorted()[i] === val);
    const sameOrder = this.oldOrder.length === this.getItemOrder().length && this.oldOrder.every((val, i) => this.getItemOrder()[i] === val);

    if (sameAttr && sameSel && sameOrder) {
      // NOOP
      // attributes have to be the same (added / remvoed columns)
      // selection has to be the same                                                 TODO just updated selection data
      // item order has to be the same (i.e. the same  items order in the same way)   TODO just update the rank, the filtering is done in getItemsDisplayed

      // console.log('reuse the data array')
    } else {
      console.log('update the data array');
      // refresh the data array
      this.data = null;
      this.oldAttributes = this.getDisplayedAttributes();

      const databaseData = new Array();

      const scoreCols = this.getScoreColumns();
      const scoresData = [].concat(...scoreCols.map((col) => this.getScoreData(col.desc)));

      this.oldOrder = this.getItemOrder();
      this.oldSelection = this.getSelectionUnsorted();

      this.provider.data.forEach((item, i) => {
        const index = this.oldOrder.indexOf(i);
        item[RankingAdapter.RANK_COLUMN_ID] = index >=0 ? index : Number.NaN; //NaN if not found

        // include wether the row is selected
        item[RankingAdapter.SELECTION_COLUMN_ID] = this.oldSelection.includes(i) ? 'Selected' : 'Unselected'; // TODO compare perfomance with assiging all Unselected and then only set those from the selection array
        const groupIndex = this.getRanking().getGroups().findIndex((grp) => grp.order.indexOf(i) >= 0);
        const groupName = groupIndex === -1 ? 'Unknown' : this.getRanking().getGroups()[groupIndex].name;
        item[RankingAdapter.GROUP_COLUMN_ID] = groupName; // index of group = category name, find index by looking up i. -1 if not found
        databaseData.push(item);
      });

      // merge score and database data
      this.data = [...databaseData.concat(scoresData)
        .reduce((map, curr) => {
          if (!map.has(curr.id)) {
            map.set(curr.id, {}); //include id in map if not already part of it, initialize with empty object
          }

          const item = map.get(curr.id); // get stored data for this id

          Object.entries(curr).forEach(([k, v]) => item[k] = v ); // add the content of the current array item to the data already stored in the map's entry (overwrites if there are the same properties in databaseData and scoreColumn)

          return map;
        }, new Map()).values()]; // give map as input and return it's value
    }

    return this.data;
  }

  /**
   * Returns an array of indices for the providers data array
   */
  private getItemOrder() {
    // order is always defined for groups (rows (data) only if there is a grouping)
    return [].concat(...this.getRanking().getGroups().map((grp) => grp.order)); // Map groups to order arrays and concat those

  }

  public getDisplayedIds() {
    const items = this.provider.data;
    return this.getItemOrder().map((i) => items[i].id);
  }


  public getDisplayedAttributes() {
    return this.getRanking().children;
  }

  /**
   * Return an array of displayed items, with their id and rank.
   *  Data Template:
   *   [{
   *     _id: 123,
   *     rank: 0
   *   },
   *  ...
   *  ]
   */
  public getItemRanks() {
    let i = 0;
    return this.getItemOrder().map((id) => ({_id: id, rank: i++}));
  }

  public getRanking(): Ranking {
    return this.provider.getRankings()[this.rankingIndex];
  }

  /**
   * Contains  selection, rank and score data.
   */
  public getGroupedData() {
    // console.time('get data (getGroupedData) time')
    const data = this.getItems();
    // console.timeEnd('get data (getGroupedData) time')
    const groups = [];

    for (const grp of this.getRanking().getGroups()) {
      groups.push({
        name: grp.name,
        label: grp.name,
        color: grp.color,
        rows: grp.order.map((index) => data[index]).filter((item) => item !== undefined)
      });
    }
    return groups;
  }


  /**
   * returns the data for the given attribute
   * @param attributeId column property of the column description
   */
  public getAttributeDataDisplayed(attributeId: string) { //  use lower case string
    const data = this.getItemsDisplayed();
    return data.map((row) => row[attributeId]);
  }

  /**
   * returns the categories of the given attribute
   * @param attributeId column property of the column description
   */
  public getAttributeCategoriesDisplayed(attributeId: string) {
    return new Set(this.getAttributeDataDisplayed(attributeId));
  }

  /**
   * Returns the index of the selected items in the provider data array
   */
  public getSelectionUnsorted() {
    return this.provider.getSelection();
  }

  /**
   * Returns the '_id' of the selected items
   */
  public getSelection() {
    // we have the indices for the unsorted data array by this.getSelectionUnsorted() {
    // and we have an array of indices to sort the data array by this.getItemOrder();
    // --> the position of the indices from the selection in the order array is the new index
    const orderedIndices = this.getItemOrder();
    const unorderedSelectionINdices = this.getSelectionUnsorted();
    const orderedSelectionIndices = unorderedSelectionINdices.map((unorderedIndex) => orderedIndices.findIndex((orderedIndex) => orderedIndex === unorderedIndex));
    const sortedOreredSelectionIndices = orderedSelectionIndices.sort((a, b) => a - b);
    return sortedOreredSelectionIndices;
  }

  public getScoreData(desc: IColumnDesc | any) {
    const accessor = desc.accessor;
    const ids = this.getDisplayedIds();
    const data = [];

    if (desc.column && isProxyAccessor(accessor)) {
      for (const id of ids) {
        const dataEntry = {id};
        dataEntry[desc.column] = accessor({v: {id}, i: null} as IDataRow); // i is not used by the accessor function
        data.push(dataEntry);
      }
    }
    return data;
  }

  /**
   * Generate a Attribute description that represents the current selection
   */
  public getSelectionDesc() {
    const selCategories = new Array<ICategory>();
    const numberOfRows = this.getItemOrder().length; // get length of groups and sum them up
    if (this.getSelectionUnsorted().length > 0) {
      selCategories.push({name: 'Selected', label: 'Selected', value: 0, color: '#1f77b4', });
    } // else: none selected

    if (this.getSelectionUnsorted().length < numberOfRows) {
      selCategories.push({name: 'Unselected', label: 'Unselected', value: 1, color: '#ff7f0e', });
    } // else: all selected

    return {
      categories: selCategories,
      label: 'Selection',
      type: 'categorical',
      column: RankingAdapter.SELECTION_COLUMN_ID
    };
  }

  /**
   * Generate an attribute description that represents the current grouping hierarchy
   */
  public getGroupDesc() {
    return {
      categories: this.getRanking().getGroups().map((group, index) => ({
        name: group.name,
        label: group.name,
        color: group.color,
        value: index
      })), // if not grouped, there is only one group ('Default')
      label: 'Groups',
      type: 'categorical',
      column: RankingAdapter.GROUP_COLUMN_ID
    };
  }

  public getRankDesc() {
    return {
      label: 'Rank',
      type: 'number',
      column: RankingAdapter.RANK_COLUMN_ID
    };
  }
}
