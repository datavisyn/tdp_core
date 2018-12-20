import LineUpPanelActions from '../LineUpPanelActions';
import {RankingAdapter} from './RankingAdapter';
import {tasks as Tasks, ATouringTask} from './Tasks';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import * as d3 from 'd3';

export default class TouringPanel extends LineUpPanelActions {

  private touringElem: HTMLElement;
  private columnOverview: HTMLElement; searchbox: HTMLElement; itemCounter: HTMLElement; // default sidepanel elements
  private ranking : RankingAdapter;
  private currentTask: ATouringTask;


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
    // For each Task, create a button
    // Link tasks with buttons
    const taskSelectForm = d3.select(this.touringElem).select('.input .type .form-group');
    const taskButtons = taskSelectForm.selectAll('.btn-wrapper').data(Tasks, (task) => task.id);

    taskButtons.enter() //enter: add a button for each task
      .append('div').attr('class', `btn-wrapper col-sm-${Math.max(Math.floor(8/Tasks.length),1)}`)
      .append('button').attr('class', 'task-btn btn btn-default btn-lg btn-block').text((task) => task.label)
        .classed('active', (d, i) => i === 0); // Activate first task

    // update: nothing to do
    taskButtons.exit().remove();   // exit: remove tasks no longer displayed
    taskButtons.order();           // order domelements as in the array
  }

  private addEventListeners() {
    // Click a different task
    d3.select(this.node).selectAll('button.task-btn').on('click', (task) => {
      const taskButtons = d3.select(this.node).selectAll('button.task-btn');
      taskButtons.classed('active', (d) => d.id === task.id);

      this.updateOutput();
    });
  }

  private initNewTask() {
    //Remove previous output
    d3.select(this.touringElem).selectAll(`div.output *`).remove(); //remove all child elemetns of output

    const task = d3.select(this.touringElem).select('button.task-btn.active').datum() as ATouringTask;
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

    this.currentTask = d3.select(this.touringElem).select('select.task option:checked').datum() as ATouringTask;
    this.currentTask.update();
  }


  private toggleTouring(hide?: boolean) {
    if(!this.touringElem) {
      return; // the elements are undefined
    }

    if (hide === undefined) {
      hide =!this.touringElem.hidden; // if not hidden -> hide
    }
    // hide touring -> not hide normal content
    this.searchbox.hidden = !hide;
    this.itemCounter.hidden = !hide;
    this.columnOverview.hidden = !hide;

    this.touringElem.hidden = hide;

    if (!hide) {
      console.log('Open Touring Panel');
      this.node.style.flex = '0.33 0.33 auto'; // lineup is 1 1 auto
      this.collapse = false; //if touring is displayed, ensure the panel is visible
      this.updateOutput(); //Will also update output
    } else {
      this.node.style.flex = null;
      this.currentTask.abort(); // abort workers
    }

    const button = d3.select(this.node).select('.lu-side-panel button.touring');
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
