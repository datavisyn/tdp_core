import LineUpPanelActions from '../LineUpPanelActions';
import {RankingAdapter} from './RankingAdapter';
import {Tasks, ATouringTask} from './Tasks'
import {IServerColumn} from '../../../rest';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {LocalDataProvider, IColumnDesc, Column, CategoricalColumn, ICategoricalColumnDesc} from 'lineupjs';
import * as d3 from 'd3';

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
      descriptions.push(this.ranking.getStratificationDesc());
      descriptions.push(this.ranking.getRankDesc());
      // Generate a Attribute description that represents the current selection
      descriptions.push(this.ranking.getSelectionDesc());
      descriptions.push({ //There is always at least the rank as numerical column
        label: 'All Numerical Columns',
        type: 'num_collection'
      });
      descriptions.push({ //There is always at least the selection as categorical column
        label: 'All Categorical Columns',
        type: 'cat_collection'
      });
      descriptions.push({ // at least selection & rank
        label: 'All Columns',
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
