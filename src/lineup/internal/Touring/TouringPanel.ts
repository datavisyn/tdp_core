import {LocalDataProvider, IColumnDesc, ICategory, Column, CategoricalColumn, Ranking, IDataRow, ICategoricalColumnDesc} from 'lineupjs';
import LineUpPanelActions from '../LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import * as d3 from 'd3';
import {isProxyAccessor} from '../utils';
import {Tasks, ATouringTask} from './Tasks'
import {IServerColumn} from '../../../rest';
import { dirtyValues } from '../../../../../node_modules/lineupjs/src/model/Column';

export default class TouringPanel extends LineUpPanelActions {

  private static EVENTTYPE = '.touring';
  private touringElem: HTMLElement;
  private columnOverview: HTMLElement; searchbox: HTMLElement; itemCounter: HTMLElement; // default sidepanel elements
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
    }));

    this.insertTasks();
    this.addEventListeners();
  }
  
  private insertTasks() {
    const taskSelect = d3.select(this.touringElem).select('select.task');
    const taskOptions = taskSelect.selectAll('option').data(Tasks, (task) => task.id); 
    
    taskOptions.enter().append('option').text((task) => task.label); //enter: add tasks to dropdown
    // update: nothing to do
    taskOptions.exit().remove();   // exit: remove tasks no longer displayed
    taskOptions.order();           // order domelements as in the array
  }

  private addEventListeners() {
    // changes made in dropdowns
    //    cause changes the displayed table / scores 
    d3.select(this.node).selectAll('select.task').on('input', () => {this.initNewTask(); this.updateOutput()});
    d3.select(this.node).selectAll('select.scope').on('input', () => this.updateOutput());

    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores 
    //  if no items are selected, the table should be displayed by a message
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + TouringPanel.EVENTTYPE, () => this.updateInput()); //fat arrow to preserve scope in called function (this)

    // column of a table was added
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN + TouringPanel.EVENTTYPE, () => this.updateInput());

    // column of a table was removed
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN + TouringPanel.EVENTTYPE, () => this.updateInput());

    // for filter changes and stratification changes
    //  After the number of items has changed, the score change aswell
    // If the stratification changes, the "Stratification" attribute and possibly the table has to be changed
    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED + TouringPanel.EVENTTYPE, () => this.updateInput());
  }

  private initNewTask() {
    //Remove previous output
    d3.select(this.touringElem).selectAll(`div.output *`).remove(); //remove all child elemetns of output

    //add legend for the p-values
    this.createLegend(d3.select(this.touringElem).selectAll('div.output'));

    const task = d3.select(this.touringElem).select('select.task option:checked').datum() as ATouringTask;
    task.init(this.ranking, d3.select(this.touringElem).select('div.output').node() as HTMLElement);
  }

  public async updateOutput() {
    if (!this.touringElem.hidden) {
      await setTimeout(() => this.updateTask(), 0);
    } else {
      console.log('Touring Panel is hidden, skip update.');
    }
  }
  private updateTask() {
    if (d3.select(this.touringElem).selectAll(`div.output *`).empty()) {
      this.initNewTask(); // First time init 
    }

    const attributes = this.prepareInput(d3.select(this.touringElem).select('select.scope'));
    const task = d3.select(this.touringElem).select('select.task option:checked').datum() as ATouringTask;
    task.update(attributes);
  }

    // creates legend for the p-value
  private createLegend(parentElement: d3.Selection<any>)
  {
    let divLegend = parentElement.append('div').classed('measure-legend',true);
    let svgLegendContainer = divLegend.append('svg')
                              .attr('width','100%')
                              .attr('height',50);

    let svgDefs = svgLegendContainer.append('defs').append('linearGradient')
                                                  .attr('id','gradLegend');    
    svgDefs.append('stop')
            .attr('offset','0%')
            .attr('stop-color','#A9A9A9'); 
    svgDefs.append('stop')
            .attr('offset','50%')
            .attr('stop-color','#FFFFFF'); 

    let svgLegendGroup = svgLegendContainer.append('g');
    let svgRect1 = svgLegendGroup.append('rect')
                                .attr('x',10)
                                .attr('y',10)
                                .attr('width',150)
                                .attr('height',15)
                                .style('fill','url(#gradLegend)')
                                .style('stroke-width',1)
                                .style('stroke','black');
    let svgText11 = svgLegendGroup.append('text')
    .attr('x',10)
    .attr('y',40)
    .attr('text-anchor','start')
    .text('0');
    let svgText12 = svgLegendGroup.append('text')
    .attr('x',85)
    .attr('y',40)
    .attr('text-anchor','middle')
    .text('0.05');
    let svgText13 = svgLegendGroup.append('text')
    .attr('x',160)
    .attr('y',40)
    .attr('text-anchor','end')
    .text('0.1');
    let svgRect2 = svgLegendGroup.append('rect')
                                .attr('x',170)
                                .attr('y',10)
                                .attr('width',150)
                                .attr('height',15)
                                .style('fill','white')
                                .style('stroke-width',1)
                                .style('stroke','black');

    let svgText21 = svgLegendGroup.append('text')
    .attr('x',170)
    .attr('y',40)
    .attr('text-anchor','start')
    .text('0.1');
    let svgText22 = svgLegendGroup.append('text')
    .attr('x',320)
    .attr('y',40)
    .attr('text-anchor','end')
    .text('1');
  }

  private updateInput() {
    if (!this.touringElem.hidden) {
      const scopeSelect = d3.select(this.touringElem).select('select.scope');
      
      let descriptions: IColumnDesc[] = this.ranking.getDisplayedAttributes().map((col: Column) => {
        const displayedCategories = this.ranking.getAttributeCategoriesDisplayed((col.desc as IServerColumn).column);
        const desc: IColumnDesc = deepCopy(col.desc);
        if ((col as CategoricalColumn).categories) {
          (desc as ICategoricalColumnDesc).categories = deepCopy((col as CategoricalColumn).categories).filter((category) => displayedCategories.has(category.name));
        }

        return desc;
      });
      // we generate an entry for every attribute (categorical, numerical, and maybe more (string?))
      // and an entry representing the selected/unselected items as a attribute with two categories
      // and an entry representing the ranked order of items as numerical attribute
      // and an entry representing the current stratification as categorical attribute
      // and an entry representing the numerical attributes (if there are any)
      // and an entry representing the categorical attributes (if there are any)
      // and an entry representing all these attributes
      descriptions = descriptions.filter((desc) => ['categorical', 'number'].includes(desc.type)); // filter attributes by type

      // Generate an attribute description that represents the current stratification
      descriptions.unshift(this.ranking.getStratificationDesc());
      descriptions.unshift(this.ranking.getRankDesc());
      // Generate a Attribute description that represents the current selection
      descriptions.unshift(this.ranking.getSelectionDesc());
      descriptions.unshift({ //There is always at least the rank as numerical column
        label: 'All numerical columns',
        type: 'num_collection'
      });
      descriptions.unshift({ //There is always at least the selection as categorical column
        label: 'All categorical columns',
        type: 'cat_collection'
      });
      descriptions.unshift({ // at least selection & rank
        label: 'All columns',
        type: 'collection'
      })

      //bind data, label is key
      const scopeOptions = scopeSelect.selectAll('option').data(descriptions, (desc) => desc.label); 
      
      scopeOptions.enter().append('option').text((desc) => desc.label); //enter: add columns to dropdown, that were added by the user
      // update: nothing to do
      scopeOptions.exit().remove();   // exit: remove columns no longer displayed
      scopeOptions.order();           // order domelements as in the array

      this.updateOutput();
    } else {
      console.log('Touring Panel is hidden, skip update.');
    }
  }


  private prepareInput(dropdown: d3.Selection<any>): IColumnDesc[] {
    const desc = dropdown.select('option:checked').datum(); // get selected option
    let filter : Array<string>;
    switch(desc.type) {
      case 'collection':
        filter = ['categorical', 'number'];
        break;
      case 'cat_collection':
        filter = ['categorical'];
        break;
      case 'num_collection':
        filter = ['number'];
        break;
      default:
        return [desc];
    }

    return dropdown.selectAll('option').data().filter((desc) => filter.includes(desc.type)); // filter from all options
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
      this.updateInput(); //Will also update output
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

export class RankingAdapter {

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
    return this.getItemOrder().map(rowId => allItems[rowId]);
  }


  public getItems(): Array<Object>{
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
      console.log('update the data array')
      // refresh the data array
      this.data = null;
      this.oldAttributes = this.getDisplayedAttributes();

      const databaseData = new Array();

      const scoreCols = this.getScoreColumns();
      const scoresData = [].concat(...scoreCols.map((col) => this.getScoreData(col.desc)));
  
      this.oldOrder = this.getItemOrder();
      this.oldSelection = this.getSelectionUnsorted();

      this.provider.data.forEach((item, i) => {
        let index = this.oldOrder.indexOf(i)
        item.rank = index >=0 ? index : Number.NaN; //NaN if not found

        // include wether the row is selected
        item.selection = this.oldSelection.includes(i) ? 'Selected' : 'Unselected'; // TODO compare perfomance with assiging all Unselected and then only set those from the selection array
        const stratGroupIndex = this.getRanking().getGroups().findIndex((grp) => grp.order.indexOf(i) >= 0);
        const stratGroupName = stratGroupIndex === -1 ? 'Unknown' : this.getRanking().getGroups()[stratGroupIndex].name
        item.strat_groups = stratGroupName; // index of group = category name, find index by looking up i. -1 if not found
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

  /**
   * Returns an array of indices for the providers data array
   */
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
    return new Set(this.getAttributeDataDisplayed(attributeId))
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
    const orderedSelectionIndices = unorderedSelectionINdices.map((unorderedIndex) => orderedIndices.findIndex((orderedIndex) => orderedIndex === unorderedIndex))
    const sortedOreredSelectionIndices = orderedSelectionIndices.sort((a, b) => a - b);
    return sortedOreredSelectionIndices;
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
    if (this.getSelectionUnsorted().length > 0) {
      selCategories.push({name: 'Selected', label: 'Selected', value: 0, color: '#1f77b4', });
    } // else: none selected

    if (this.getSelectionUnsorted().length < numberOfRows) {
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
      categories: this.getRanking().getGroups().map((group, index) => ({
        name: group.name,
        label: group.name,
        color: group.color,
        value: index
      })), // if not stratifified, there is only one group ('Default')
      label: 'Stratification Groups',
      type: 'categorical',
      column: 'strat_groups'
    }
  }

  public getRankDesc() {
    return {
      label: 'Rank',
      type: 'number',
      column: 'rank'
    }
  }
}



// SOURCE: https://stackoverflow.com/a/51592360/2549748
/**
 * Deep copy function for TypeScript.
 * @param T Generic type of target/copied value.
 * @param target Target value to be copied.
 * @see Source project, ts-deepcopy https://github.com/ykdr2017/ts-deepcopy
 * @see Code pen https://codepen.io/erikvullings/pen/ejyBYg
 */
const deepCopy = <T>(target: T): T => {
  if (target === null) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime()) as any;
  }
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => { cp.push(v); });
    return cp.map((n: any) => deepCopy<any>(n)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as { [key: string]: any };
    Object.keys(cp).forEach(k => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};
