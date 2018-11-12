import {ICategoricalColumnDesc, ICategoricalColumn, LocalDataProvider, IColumnDesc, ICategory, CategoricalColumn, Column, Ranking, IDataRow, IStringMapColumnDesc} from 'lineupjs';
import LineUpPanelActions from '../LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, ISimilarityMeasure, MeasureMap, intersection, Comparison, Type} from 'touring';
import * as d3 from 'd3';
import 'd3.parsets';
import 'd3-grubert-boxplot';
import {isProxyAccessor} from '../utils';

export default class TouringPanel extends LineUpPanelActions {

  private static EVENTTYPE = '.touring';
  private touringElem: HTMLElement;
  private columnOverview: HTMLElement; searchbox: HTMLElement; itemCounter: HTMLElement; // default sidepanel elements
  private itemTab: Node; attributeTab: Node;
  private ranking : RankingAdapter;


  protected init() {
    super.init();
    this.ranking = new RankingAdapter(this.provider);
    this.node.insertAdjacentHTML('beforeend', panelHTML);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');

    this.columnOverview = <HTMLElement>this.node.querySelector('main')!; // ! = bang operator --> can not be null
    this.searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
    this.itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'touring fa fa-calculator', () => {
      this.toggleTouring();

      console.log('provider', this.provider);
      console.log('provider.getSelection: ', this.provider.getSelection(), ' of ', this.provider.getTotalNumberOfRows());
      // console.log('provider.selectedRows: ', this.provider.selectedRows());
      // console.log('provider.getColumns: ', this.provider.getColumns());
      // console.log('provider.getRanking: ', this.provider.getRankings());
      console.log('getGroups', this.provider.getRankings()[0].getGroups())
      console.log('provider.getRankings()[0].children: ', this.provider.getRankings()[0].children);
      // console.log('provider.getFilter: ', this.provider.getFilter()); //TODO use filter
      // console.log('data', this.provider.data);
      console.log('------------------------------------');
    }));

    this.addEventListeners();
  }

  private addEventListeners() {
    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores 
    //  if no items are selected, the table should be displayed by a message
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + TouringPanel.EVENTTYPE, () => this.updateTouringPanel()); //fat arrow to preserve scope in called function (this)

    // column of a table was added
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN + TouringPanel.EVENTTYPE, () => this.updateTouringPanel());

    // column of a table was removed
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN + TouringPanel.EVENTTYPE, () => this.updateTouringPanel());

    // for filter changes and stratification changes
    //  After the number of items has changed, the score change aswell
    // If the stratification changes, the "Stratification" attribute and possibly the table has to be changed
    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED + TouringPanel.EVENTTYPE, () => this.updateTouringPanel());
  }

  private updateTouringPanel() {
    if (!this.touringElem.hidden) {
      //TODO
    } else {
      console.log('Touring Panel is hidden, skip update.');
    }
  }
  
  private toggleTouring(hide?: boolean) {
    if(!this.touringElem)
      return; // the elements are undefined
    
    if (hide === undefined) {
      // if not hidden -> hide
      hide =!this.touringElem.hidden;
    }
    // hide touring -> not hide normal content
    this.searchbox.hidden = !hide;
    this.itemCounter.hidden = !hide;
    this.columnOverview.hidden = !hide;
    
    this.touringElem.hidden = hide;

    if (!hide) {
      console.log('Open Touring Panel')
      this.node.style.flex = "0.33 0.33 auto"; // lineup is 1 1 auto
      this.collapse = false; //if touring is displayed, ensure the panel is visible
      this.updateTouringPanel();
    } else {
      this.node.style.flex = null;
    }
    
    const button = d3.select(this.node).select('.lu-side-panel button.touring')
    button.classed('active', !hide);
  }

  get collapse() {
    return this.node.classList.contains('collapsed');
  }
  
  set collapse(value: boolean) {
    this.node.classList.toggle('collapsed', value);
    if (value) {
      // panel gets collapsed, Touring is hidden to ensure the default look when the panel is expanded again.
      this.toggleTouring(true);
    }
  }
}

class RankingAdapter {

  constructor(protected readonly provider: LocalDataProvider, private rankingIndex = 0) {
    // console.log('provider', this.provider);
    // console.log('provider.getSelection: ', this.provider.getSelection(), ' of ', this.provider.getTotalNumberOfRows());
    // console.log('provider.selectedRows: ', this.provider.selectedRows());
    // console.log('provider.getColumns: ', this.provider.getColumns());
    // console.log('provider.getRanking: ', this.provider.getRankings());
    // console.log('getGroups', this.provider.getRankings()[0].getGroups())
    // console.log('provider.getRankings()[0].children: ', this.provider.getRankings()[0].children);
    // console.log('provider.getFilter: ', this.provider.getFilter()); //TODO use filter
    // console.log('data', this.provider.data);
    // console.log('------------------------------------');
  }

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
  public getItemsDisplayed(): Array<Object> {
    const allItems = this.getItems();
    // get currently displayed data
    return this.getItemOrder().map(rowId => allItems[rowId]);
  }


  public getItems(): Array<Object>{
    // if the attributes are the same, we can reuse the data array
    // if the selection

    // TODO events may be better?
    const sameAttr = this.oldAttributes.length === this.getDisplayedAttributes().length && this.oldAttributes.filter((attr) => /*note the negation*/ !this.getDisplayedAttributes().some((attr2) => attr2.desc.label === attr.desc.label)).length === 0;
    const sameSel = this.oldSelection.length === this.getSelection().length && this.oldSelection.every((val, i) => this.getSelection()[i] === val);
    const sameOrder = this.oldOrder.length === this.getItemOrder().length && this.oldOrder.every((val, i) => this.getItemOrder()[i] === val);

    if (sameAttr && sameSel && sameOrder) {
      // NOOP
      // attributes have to be the same (added / remvoed columns)
      // selection has to be the same                                                 TODO just updated selection data
      // item order has to be the same (i.e. the same  items order in the same way)   TODO just update the rank, the filtering is done in getItemsDisplayed

      // console.log('reuse the data array')
    } else {
      console.log('update the data array')
      // refresh the data array
      this.data = null;
      this.oldAttributes = this.getDisplayedAttributes();

      const databaseData = new Array();

      const scoreCols = this.getScoreColumns();
      const scoresData = [].concat(...scoreCols.map((col) => this.getScoreData(col.desc)));
  
      this.oldOrder = this.getItemOrder();
      this.oldSelection = this.getSelection();

      this.provider.data.forEach((item, i) => {
        let index = this.oldOrder.indexOf(i)
        item.rank = index >=0 ? index : Number.NaN; //NaN if not found

        // include wether the row is selected
        item.selection = this.oldSelection.includes(i) ? 'Selected' : 'Unselected'; // TODO compare perfomance with assiging all Unselected and then only set those from the selection array
        item.strat_groups = this.getRanking().getGroups().findIndex((grp) => grp.order.indexOf(i) >= 0); // index of group = category name, find index by looking up i. -1 if not found
        databaseData.push(item);
      })
  
      // merge score and database data
      this.data = [...databaseData.concat(scoresData)
        .reduce((map, curr) => {
          map.has(curr.id) || map.set(curr.id, {}); //include id in map if not already part of it, initialize with empty object
          
          const item = map.get(curr.id); // get stored data for this id
  
          Object.entries(curr).forEach(([k, v]) => item[k] = v ); // add the content of the current array item to the data already stored in the map's entry (overwrites if there are the same properties in databaseData and scoreColumn)
          
          return map;
        }, new Map()).values()]; // give map as input and return it's value
    }

    return this.data;
  }

  private getItemOrder() {
    // order is always defined for groups (rows (data) only if there is an stratification)
    return [].concat(...this.getRanking().getGroups().map((grp) => grp.order)); // Map groups to order arrays and concat those

  }

  public getDisplayedIds() {
    const items = this.provider.data;
    return this.getItemOrder().map((i) => items[i].id)
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
    let groups = []

    for (let grp of this.getRanking().getGroups()) {
      groups.push({
        name: grp.name,
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
    return new Set(this.getAttributeDataDisplayed(attributeId))
  }

  public getSelection() {
    return this.provider.getSelection();
  }

  public getScoreData(desc: IColumnDesc | any) {
    const accessor = desc.accessor;
    const ids = this.getDisplayedIds();
    let data = [];

    if (desc.column && isProxyAccessor(accessor)) {
      for (let id of ids) {
        let dataEntry = {id: id};
        dataEntry[desc.column] = accessor({v: {id: id}, i: null} as IDataRow); // i is not used by the accessor function
        data.push(dataEntry); 
      }
    }
    return data;
  }


  public getSelectionDesc() {
    const selCategories = new Array<ICategory>();
    const numberOfRows = this.getItemOrder().length; // get length of stratification groups and sum them up
    if (this.getSelection().length > 0) {
      selCategories.push({name: 'Selected', label: 'Selected', value: 0, color: '#1f77b4', });
    } // else: none selected

    if (this.getSelection().length < numberOfRows) {
      selCategories.push({name: 'Unselected', label: 'Unselected', value: 1, color: '#ff7f0e', })
    } // else: all selected

    return {
      categories: selCategories,
      label: 'Selection',
      type: 'categorical',
      column: 'selection'
    };
  }

  public getStratificationDesc() {
    return {
      categories: this.getRanking().getGroups().map((group) => ({
        name: group.name,
        label: group.name
        // TODO get colors of stratification
      })), // if not stratifified, there is only one group ('Default')
      label: 'Stratification Groups',
      type: 'categorical',
      column: 'strat_groups'
    }
  }

  public getRankDesc() {
    return {
      label: 'Rank',
      type: 'numerical',
      column: 'rank'
    }
  }
}
