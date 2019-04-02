import {IServerColumn} from '../../../../rest';
import {RankingAdapter, IAttributeCategory} from '../RankingAdapter';
import {MethodManager, IMeasureResult, ISimilarityMeasure, IMeasureVisualization, ISetParameters, Type, SCOPE, WorkerManager} from 'touring';
import {IColumnDesc, ICategory, Column, CategoricalColumn, ICategoricalColumnDesc, LocalDataProvider} from 'lineupjs';
import colCmpHtml from 'html-loader!./ColumnComparison.html'; // webpack imports html to variable
import colCmpIcon from './colCmp.png';
import rowCmpHtml from 'html-loader!./RowComparison.html'; // webpack imports html to variable
import rowCmpIcon from './rowCmp.png';
import * as $ from 'jquery';
import * as d3 from 'd3';
import * as XXH from 'xxhashjs';
import {isNumber} from 'util';

export const tasks = new Array<ATouringTask>();
export function TaskDecorator() {
  return function (target: {new(): ATouringTask}) { // only instantiable subtypes of ATouringTask can be passed.
    tasks.push(new target());
    tasks.sort((a, b) => b.order - a.order); //sort descending
  };
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
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k]);
    });
    return cp as T;
  }
  return target;
};


export interface ITouringTask {
  id: string;
  label: string;

  scope: SCOPE; // Does the Task use attributes or subsets of them?
}


export abstract class ATouringTask implements ITouringTask {
  public static EVENTTYPE = '.touringTask';
  public id: string;
  public label: string;
  public node: HTMLElement;
  public icon: string;

  public scope: SCOPE;

  public order: number = 0; // order of the tasks, the higher the more important

  ranking: RankingAdapter;

  private hoverTimerId: number;

  public abort() {
    WorkerManager.terminateAll();
  }

  public init(ranking: RankingAdapter, node: HTMLElement) {
    this.ranking = ranking;
    this.node = d3.select(node).append('div').attr('class', `task ${this.id}`).node() as HTMLElement;
    this.hide(); //hide initially
    this.initContent();
  }

  public show() {
    d3.select(this.node).attr('hidden', null);
    this.addEventListeners();
    this.update(true);
  }

  public hide() {
    d3.select(this.node).attr('hidden', true);
    this.removeEventListeners();
  }

  initContent() {
    // add legend for the p-values
    this.createLegend(d3.select(this.node).select('div.legend'));
  }

  createSelect2(): void {
    // make selectors functional
    const updateTable = this.updateTable.bind(this);
    d3.select(this.node).selectAll('select').each(function() { // Convert to select2
      const select2 = this;
      //console.log('convert', select2.name);
      const $select2 = $(select2).select2({width: '100%', allowClear: true, closeOnSelect: false, placeholder: 'Select one or more columns. '});
      $select2.on('select2:select select2:unselect', updateTable);
      $select2.on('select2:open', () => { // elements are created when select2 is opened, and destroyed when closed
        setTimeout(() => { // setTimeout so this shit actually works (mouseover listener not registered if done immidiatly)
          const optgroups = d3.selectAll('.select2-results__group');
          optgroups.on('click', function() {
            const hoverGrp = d3.select(this).text(); // get text of hovered select2 label
            // update html in the actual select html element
            const optGroup = d3.select(select2).select(`optgroup[label="${hoverGrp}"]`); //get optgroup of hovered select2 label
            const options = optGroup.selectAll('option');
            const newState = !options.filter(':not(:checked)').empty(); // if not all options are selected --> true = select all, deselect if all options are already selected
            options.each(function() {(this as HTMLOptionElement).selected = newState;}); // set state of all child options
            // update styles in open dropdown
            $(this).next().find('li').attr('aria-selected', newState.toString()); // accesability and styling

            $select2.trigger('change').trigger(newState ? 'select2:select' : 'select2:unselect'); // notify select2 of these updates
          });
        }, 0);
      });
    });
  }

  updateSelect2(): void {
    // console.log('update select2');
    this.destroySelect2();
    this.createSelect2();
  }

  destroySelect2(): void {
    // check if initialized with class, see: https://select2.org/programmatic-control/methods#checking-if-the-plugin-is-initialized
    d3.select(this.node).selectAll('select.select2-hidden-accessible').each(function() {
      $(this).select2('destroy'); // reset to standard select element
      // unbind events: https://select2.org/programmatic-control/methods#event-unbinding
      $(this).off('select2:select');
      $(this).off('select2:unselect');
    });
  }

  updateTableDescription(isTableEmpty: boolean): any {
    if (isTableEmpty) {
      const text = 'Please specify the data to compare with the select boxes above.';
      d3.select(this.node).select('header').style('width', null).select('p').text(text);
    } else {
      const text = 'Click on a p-Value in the table for details.';
      d3.select(this.node).select('header').style('width', '13em').select('p').text(text);
    }
  }

  private addEventListeners() {
    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores
    this.ranking.getProvider().on(LocalDataProvider.EVENT_SELECTION_CHANGED + ATouringTask.EVENTTYPE, () => this.update(true)); //fat arrow to preserve scope in called function (this)

    // column of a table was added/removed
    //  causes changes in the available attributes (b)
    //  might cause changes the displayed table / scores
    this.ranking.getProvider().on(LocalDataProvider.EVENT_ADD_COLUMN + ATouringTask.EVENTTYPE, () => { /*console.log('added column');*/ this.update(false); });
    this.ranking.getProvider().on(LocalDataProvider.EVENT_REMOVE_COLUMN + ATouringTask.EVENTTYPE, () => { /*console.log('rem column');*/ this.update(false); });

    // for filter changes and grouping changes
    //  After the number of items has changed, the score change aswell
    // If the grouping changes, the "Group" attribute and possibly the table has to be changed
    this.ranking.getProvider().on(LocalDataProvider.EVENT_ORDER_CHANGED + ATouringTask.EVENTTYPE, () => this.update(true));
  }

  private removeEventListeners() {
    this.ranking.getProvider().on(LocalDataProvider.EVENT_SELECTION_CHANGED + ATouringTask.EVENTTYPE, null);
    this.ranking.getProvider().on(LocalDataProvider.EVENT_ADD_COLUMN + ATouringTask.EVENTTYPE, null);
    this.ranking.getProvider().on(LocalDataProvider.EVENT_REMOVE_COLUMN + ATouringTask.EVENTTYPE, null);
    this.ranking.getProvider().on(LocalDataProvider.EVENT_ORDER_CHANGED + ATouringTask.EVENTTYPE, null);
  }

  public abstract update(forceTableUpdate: boolean): void;
  public abstract updateTable(): void;


  getAttriubuteDescriptions(): IColumnDesc[] {
    let descriptions: IColumnDesc[] = this.ranking.getDisplayedAttributes().map((col: Column) => {
      const desc: IColumnDesc = deepCopy(col.desc);
      if ((col as CategoricalColumn).categories) {
        const displayedCategories = this.ranking.getAttributeCategoriesDisplayed((col.desc as IServerColumn).column);
        (desc as ICategoricalColumnDesc).categories = deepCopy((col as CategoricalColumn).categories).filter((category) => displayedCategories.has(category.name));
      }

      return desc;
    });

    const validTypes = ['categorical', 'number'];
    descriptions = descriptions.filter((desc) => validTypes.includes(desc.type)); // filter attributes by type
    const groupDesc = this.ranking.getGroupDesc();
    const reallyGrouped = groupDesc.categories.length > 1; //grouping is only the "default group"
    const groupingHierarchy = reallyGrouped && groupDesc.categories.some((cat) => cat.label.indexOf('∩') >= 0); //not grouping hierachy if intersection symbol is not in label (https://github.com/lineupjs/lineupjs/blob/60bffa3b8c665bd7fa28c1ab577ba24dba84913c/src/model/internal.ts#L31)
    if(groupingHierarchy) {
      descriptions.unshift(groupDesc);
    }
    descriptions.unshift(this.ranking.getSelectionDesc());
    descriptions.unshift(this.ranking.getRankDesc());
    return descriptions;
  }

  toScoreCell(score: IMeasureResult, measure :ISimilarityMeasure, setParameters: ISetParameters, highlightData: IHighlightData[]): IScoreCell {
    let color =  score2color(score.pValue);
    let cellLabel = score.pValue.toFixed(3);

    cellLabel = cellLabel.startsWith('0') ? cellLabel.substring(1) : score.pValue.toFixed(2); // [0,1) --> .123, 1 --> 1.00
    if(score.pValue > 0.1) {
      color = {
        background: '#ffffff', //white
        foreground: '#ffffff', //white
      };
    }
    if(score.pValue === -1) {
      cellLabel = '-';
      color = {
        background: '#ffffff', //white
        foreground: '#ffffff', //white
      };
    }
    return {
      label: cellLabel,
      background: color.background,
      foreground: color.foreground,
      score,
      measure,
      setParameters,
      highlightData
    };
  }

  // creates legend for the p-value
  private createLegend(parentElement: d3.Selection<any>) {
    const divLegend = parentElement.append('div').classed('measure-legend',true);

    const svgLegendContainer = divLegend.append('svg')
                              .attr('width','100%')
                              .attr('height',50);
                              // .attr('viewBox','0 0 100% 35')
                              // .attr('preserveAspectRatio','xMaxYMin meet');

    const legendId = Date.now();
    const svgDefs = svgLegendContainer.append('defs').append('linearGradient')
                                                  .attr('id','pValue-gradLegend-'+legendId);
    svgDefs.append('stop')
            .attr('offset','0%')
            .attr('stop-color','#000000');
    // svgDefs.append('stop')
    //         .attr('offset','50%')
    //         .attr('stop-color','#F1F1F1');
    svgDefs.append('stop')
            .attr('offset','25%')
            .attr('stop-color','#FFFFFF');

    let xStart = 0;
    const yStart = 0;
    const barWidth = 300;
    const barHeight = 10;
    const space = 5;
    const textHeight = 15;
    const textWidth = 50;
    const tickLength = 5;
    const lineWidth = 1;

    xStart = xStart + textWidth;
    const svgLegend = svgLegendContainer.append('g');
    const svgLegendLabel = svgLegend.append('g');
    // label
    svgLegendLabel.append('text')
    .attr('x',xStart)
    .attr('y',yStart+barHeight)
    .attr('text-anchor','end')
    .text('p-Value');

    xStart = xStart + space;

    const svgLegendGroup = svgLegend.append('g');
    // bar + bottom line
    svgLegendGroup.append('rect')
      .attr('x',xStart).attr('y',yStart)
      .attr('width',barWidth)
      .attr('height',barHeight)
      .style('fill','url(#pValue-gradLegend-'+legendId+')');
    svgLegendGroup.append('line')
      .attr('x1',xStart).attr('y1',yStart+barHeight)
      .attr('x2',xStart+barWidth).attr('y2',yStart+barHeight)
      .style('stroke-width',lineWidth).style('stroke','black');

    // label: 0 + tick
    svgLegendGroup.append('text')
      .attr('x',xStart).attr('y',yStart+barHeight+textHeight)
      .attr('text-anchor','middle').text('0');
    svgLegendGroup.append('line')
      .attr('x1',xStart).attr('y1',yStart)
      .attr('x2',xStart).attr('y2',yStart+barHeight-(lineWidth/2)+tickLength)
      .style('stroke-width',lineWidth/2).style('stroke','black');

    // label: 0.05 + tick
    svgLegendGroup.append('text')
      .attr('x',xStart+(barWidth*0.25)).attr('y',yStart+barHeight+textHeight)
      .attr('text-anchor','middle').text('0.05');
    svgLegendGroup.append('line')
      .attr('x1',xStart+(barWidth*0.25)).attr('y1',yStart+barHeight-(lineWidth/2))
      .attr('x2',xStart+(barWidth*0.25)).attr('y2',yStart+barHeight-(lineWidth/2)+tickLength)
      .style('stroke-width',lineWidth/2).style('stroke','black');

      // label: 0.05 + tick
    svgLegendGroup.append('text')
      .attr('x',xStart+(barWidth*0.5)).attr('y',yStart+barHeight+textHeight)
      .attr('text-anchor','middle').text('0.1');
    svgLegendGroup.append('line')
      .attr('x1',xStart+(barWidth*0.5)).attr('y1',yStart+barHeight-(lineWidth/2))
      .attr('x2',xStart+(barWidth*0.5)).attr('y2',yStart+barHeight-(lineWidth/2)+tickLength)
      .style('stroke-width',lineWidth/2).style('stroke','black');

    // label: 0.5 + tick
    svgLegendGroup.append('text')
      .attr('x',xStart+(barWidth*0.75)).attr('y',yStart+barHeight+textHeight)
      .attr('text-anchor','middle').text('0.5');
    svgLegendGroup.append('line')
      .attr('x1',xStart+(barWidth*0.75)).attr('y1',yStart+barHeight-(lineWidth/2))
      .attr('x2',xStart+(barWidth*0.75)).attr('y2',yStart+barHeight-(lineWidth/2)+tickLength)
      .style('stroke-width',lineWidth/2).style('stroke','black');

    // label: 1 + tick
    svgLegendGroup.append('text')
      .attr('x',xStart+barWidth).attr('y',yStart+barHeight+textHeight)
      .attr('text-anchor','middle').text('1');
    svgLegendGroup.append('line')
      .attr('x1',xStart+barWidth).attr('y1',yStart)
      .attr('x2',xStart+barWidth).attr('y2',yStart+barHeight-(lineWidth/2)+tickLength)
      .style('stroke-width',lineWidth/2).style('stroke','black');

    // label: no p-value correction
    svgLegendLabel.append('text')
    .attr('x',xStart)
    .attr('y',yStart+barHeight+2*textHeight)
    .attr('text-anchor','start')
    .text('No p-Value correction for multiple comparisons.');

  }

  // removes mini visualization with details, and highlighting
  private removeCellDetails (details: d3.Selection<any>) {
    // remove bg highlighting from all tds
    d3.select(this.node).selectAll('div.table-container').selectAll('td').classed('selectedCell', false);

    // remove saved selection from session storage
    const selCellObj = {task: this.id, colLabel: null, rowLabels: null };
    console.log('selectionLabels: ', selCellObj);
    const selCellObjString = JSON.stringify(selCellObj);
    sessionStorage.setItem('touringSelCell', selCellObjString);

    // remove mini visualization with details
    details.selectAll('*').remove();
  }

  // generates the detail inforamtion to the test and the remove button
  private generateVisualDetails (miniVisualisation: d3.Selection<any>, measure: ISimilarityMeasure, measureResult: IMeasureResult, setParameters: ISetParameters) {

    const divDetailInfoContainer = miniVisualisation.append('div')
                                    .classed('detailVisContainer',true);

    //button for mini visualization removal
    const that = this;
    const detailRemoveButton = divDetailInfoContainer.append('button');
    detailRemoveButton.attr('class','btn btn-default removeMiniVis-btn');
    detailRemoveButton.on('click', function() { that.removeCellDetails.bind(that)(miniVisualisation); });
    detailRemoveButton.html('x');

    const divDetailInfo = divDetailInfoContainer.append('div')
                                    .classed('detailVis',true);

    // the 2 compared sets
    const setALabel = setParameters.setACategory ? setParameters.setACategory.label : setParameters.setADesc.label;
    const setBLabel = setParameters.setBCategory ? setParameters.setBCategory.label : setParameters.setBDesc.label;
    const detailSetInfo = divDetailInfo.append('div')
                    .classed('detailDiv',true);
    if(setParameters.setACategory) {
      detailSetInfo.append('span')
                    .classed('detail-label',true)
                    .text('Data Column: ')
                      .append('span')
                      .text(setParameters.setADesc.label);
      detailSetInfo.append('span')
                    .text(' / ');
    }
    detailSetInfo.append('span')
                  .classed('detail-label',true)
                  .text('Comparing ');
    detailSetInfo.append('span')
                  .text(setALabel+' ')
                    .append('span')
                    .text('['+measureResult.setSizeA+']');
    detailSetInfo.append('span')
                  .classed('detail-label',true)
                  .text(' vs. ');
    detailSetInfo.append('span')
                  .text(setBLabel+' ')
                    .append('span')
                    .text('['+measureResult.setSizeB+']');

    // test value + p-value
    const scoreValue = isNumber(measureResult.scoreValue) && !isNaN(measureResult.scoreValue) ? measureResult.scoreValue.toFixed(3) : 'n/a';
    const pValue = measureResult.pValue === -1 ? 'n/a' : (measureResult.pValue as number).toExponential(3);
    const detailInfoValues = divDetailInfo.append('div')
                          .classed('detailDiv',true);
                          // .text(`Test-Value: ${scoreValue}, p-Value: ${pValue}`);
    detailInfoValues.append('span')
                    .classed('detail-label',true)
                    .text(measure.label + ': ');
    detailInfoValues.append('span')
                    .text(scoreValue);

    detailInfoValues.append('span')
                    .text(', ');

    detailInfoValues.append('span')
                    .classed('detail-label',true)
                    .text('p-Value: ');
    detailInfoValues.append('span')
                    .text(pValue);

    // test description
    divDetailInfo.append('div')
                  .classed('detailDiv',true)
                  .text('Description: ')
                  .append('span')
                  .text(measure.description);
  }

  protected updateSelectionAndVisuallization (row) {

    // current task
    const currTask = d3.select(this.node).attr('class');
    // save selection
    const selCellObjString = sessionStorage.getItem('touringSelCell');
    const selCellObj = JSON.parse(selCellObjString);
    // console.log('stored selection labels: ', selCellObj);

    if(selCellObj && currTask === selCellObj.task) {

      let rowLabel = null;
      let categoryLabel = null;
      if(selCellObj.rowLabels !== null && selCellObj.rowLabels.length === 1) {
        rowLabel = selCellObj.rowLabels[0];
      } else  if(selCellObj.rowLabels !== null && selCellObj.rowLabels.length === 2) {
        const firstEle = selCellObj.rowLabels[0];

        rowLabel = firstEle.rowspan !== null ? firstEle : selCellObj.rowLabels[1];
        categoryLabel = firstEle.rowspan !== null ? selCellObj.rowLabels[1] : firstEle;
      }
      // console.log('selected labels: ',{selCellObj,rowLabel,categoryLabel});

      // get index for column
      let colIndex = null;
      d3.select(this.node).select('thead').selectAll('th').each(function (d,i) {
        const classedHead = d3.select(this).classed('head');
        const classedRotate = d3.select(this).classed('rotate');
        if(classedHead && classedRotate) {
          const currCol = d3.select(this) === null ? '' : d3.select(this).text();
          // console.log('currCol:', currCol, ' | index: ', i);
          if(currCol === selCellObj.colLabel) {
            colIndex = i;
          }
        }

      });
      // get table body
      let tableBody = null;
      d3.select(this.node).selectAll('tbody').select('tr:nth-child(1)').select('td:nth-child(1)').each(function (d) {
        const currRow = d3.select(this).select('b').text();
        if (rowLabel !== null && currRow === rowLabel.label) {
          tableBody = this.parentNode.parentNode;
        }
      });


      let selectedCell = null;
      // look for last selected cell
      if(colIndex !== null && tableBody !== null) {

        // console.log('selectedBody: ', tableBody, ' | colIndex: ' ,colIndex);
        if(categoryLabel === null) {
          const allTds = d3.select(tableBody).select('tr').selectAll('td');
          selectedCell = allTds[0][colIndex];
        } else {
          d3.select(tableBody).selectAll('tr').each(function (d,i) {
            const currTds = d3.select(this).selectAll('td');
            const catIndex = i === 0 ? 1 : 0;
            const cellIndex = i === 0 ? colIndex : colIndex-1;
            const currCate = d3.select(currTds[0][catIndex]).text();
            if(currCate === categoryLabel.label) {
              selectedCell = currTds[0][cellIndex];
            }
          });
        }

        // console.log('updateSelectionAndVisuallization: ', {row, tableBody, colIndex, selectedCell});
        // highlight selected cell and update visualization
        if(selectedCell) {
          const cellData = d3.select(selectedCell).datum();
          // console.log('selectedCell data: ', cellData);

          // highlight selected cell
          this.highlightSelectedCell(selectedCell, cellData);

          if(row !== null && row.label === rowLabel.label) {
            // generate visualization for cell
            this.visualizeSelectedCell(selectedCell, cellData);
          }
        }
      }


    }
  }

  private highlightSelectedCell(tableCell, cellData) {
    // remove bg highlighting from all tds
    d3.select(this.node).selectAll('td').classed('selectedCell', false);

    if (cellData.score) { //Currenlty only cells with a score are calculated (no category or attribute label cells)
      // Color table cell
      d3.select(tableCell).classed('selectedCell', true); // add bg highlighting
    }

  }

  private visualizeSelectedCell(tableCell, cellData) {
    // remove all old details
    const details = d3.select(this.node).select('div.details');
    details.selectAll('*').remove(); // avada kedavra outdated details!

    if (cellData.score) { //Currenlty only cells with a score are calculated (no category or attribute label cells)

      const resultScore : IMeasureResult = cellData.score;
      const measure : ISimilarityMeasure = cellData.measure;

      // Display details
      if(measure) {
        this.generateVisualDetails(details, measure, resultScore, cellData.setParameters); //generate description into details div
      } else {
        details.append('p').text('There are no details for the selected table cell.');
      }

      // display visualisation
      if(measure.visualization) {
        const visualization: IMeasureVisualization = measure.visualization;
        if(cellData.setParameters) {
          visualization.generateVisualization(details, cellData.setParameters, cellData.score);
        }

      }
    }
  }

  onClick(tableCell) {
    const cellData = d3.select(tableCell).datum();
    console.log('Cell click - data: ',cellData);

    // save data for selected cell in sesisonStorage
    let selCellObj;
    const task = d3.select(this.node).attr('class');
    // save selected cell in sessionStorage
    if (cellData.measure !== null && cellData.score) {
      const colLabel = d3.select(this.node).selectAll('span.cross-selection').text();
      const rowLabels = [];
      d3.select(this.node).selectAll('td.cross-selection').each(function (d) {
        const label = d3.select(this).text();
        const rowspan = d3.select(this).attr('rowspan');
        const obj = {label, rowspan };
        rowLabels.push(obj);
      });

      // create selected cell object
      selCellObj = {task, colLabel, rowLabels};
    } else {
      selCellObj = {task, colLabel: null, rowLabels: null };
    }

    console.log('selectionLabels: ', selCellObj);
    const selCellObjString = JSON.stringify(selCellObj);
    sessionStorage.setItem('touringSelCell', selCellObjString);

    this.highlightSelectedCell(tableCell, cellData);
    this.visualizeSelectedCell(tableCell, cellData);
  }

  onMouseOver(tableCell, state: boolean) {
    if(d3.select(tableCell).classed('score')) {

      const tr = tableCell.parentNode; //current row
      const tbody = tr.parentNode;     //current body
      const table = tbody.parentNode;  //current table

      const allTds = d3.select(tr).selectAll('td');
      // console.log('allTds', allTds[0]);
      let index = -1;
      const currLength = allTds[0].length;
      // get current index of cell in row
      for(let i=0; i<currLength; i++) {
        if(allTds[0][i] === tableCell) {
          index = i;
        }
      }

      // highlight all label cells in row
      d3.select(tr).selectAll('td:not(.score)').classed('cross-selection',state);
      // highlight the first cell in the first row of the cells tbody
      d3.select(tbody).select('tr').select('td').classed('cross-selection',state);

      // maxIndex is the maximum number of table cell in the table
      const maxLength = d3.select(tbody).select('tr').selectAll('td')[0].length;

      // if currMaxIndex and maxIndex are not the same -> increase headerIndex by one
      // because the current row has one cell fewer
      const headerIndex = (currLength === maxLength) ? index : index+1;

      // highlight column label
      const allHeads = d3.select(table).select('thead').selectAll('th');
      if(index > -1) {
        // use header index
        d3.select(allHeads[0][headerIndex]).select('div').select('span').classed('cross-selection',state);
      }

      const cellData = d3.select(tableCell).datum() as IScoreCell;
      if (cellData && cellData.highlightData) {
        if (state) {
          this.hoverTimerId = window.setTimeout(() => { //highlight after 800ms if mouse is still on cell
            // highlight col headers
            let id;
            for (const attr of cellData.highlightData.filter((data) => data.category === undefined)) {
              const header = d3.select(`.lineup-engine header .lu-header[title^="${attr.label}"]`).classed('touring-highlight', true); // |= starts with whole word (does not work for selection checkboxes)
              id = header.attr('data-col-id');
            }

            if (id) {
              // highlight cat rows
              for (const attr of cellData.highlightData.filter((data) => data.category !== undefined)) {
                const indices = this.ranking.getAttributeDataDisplayed(attr.column).reduce((indices,cat,index) => cat === attr.category ? [...indices, index] : indices, []);
                for (const index of indices) {
                  const elem = d3.select(`.lineup-engine main .lu-row[data-index="${index}"] [data-id="${id}"]`);
                  if (!elem.empty()) {
                    const setDarker = elem.classed('touring-highlight');
                    elem.classed('touring-highlight', true)
                        .classed('touring-highlight-dark', setDarker);

                    const catId = d3.select(`.lineup-engine header .lu-header[title^="${attr.label}"]`).attr('data-col-id');
                    d3.select(`.lineup-engine main .lu-row[data-index="${index}"] [data-id="${catId}"]`).classed('touring-highlight-border', true);
                  }
                }
              }
            }
          }, 200);
        } else {
          window.clearTimeout(this.hoverTimerId);
          d3.selectAll('.touring-highlight,.touring-highlight-dark,.touring-highlight-border').classed('touring-highlight touring-highlight-dark touring-highlight-border', false);
        }
      }
    }
  }

  createToolTip(tableCell) : String {
    if(d3.select(tableCell).classed('score') && d3.select(tableCell).classed('action')) {
      const tr = tableCell.parentNode; //current row
      const tbody = tr.parentNode;     //current body
      const table = tbody.parentNode;  //current table

      const allTds = d3.select(tr).selectAll('td');
      // console.log('allTds', allTds[0]);
      let index = -1;
      const currLength = allTds[0].length;
      // get current index of cell in row
      for(let i=0; i<currLength; i++) {
        if(allTds[0][i] === tableCell) {
          index = i;
        }
      }

      // all label cells in row
      const rowCategories = [];
      d3.select(tr).selectAll('td:not(.score)').each(function() {
        rowCategories.push(d3.select(this).text());
      });
      // the first cell in the first row of the cells tbody
      const row = d3.select(tbody).select('tr').select('td').text();

      // maxIndex is the maximum number of table cell in the table
      const maxLength = d3.select(tbody).select('tr').selectAll('td')[0].length;

      // if currMaxIndex and maxIndex are not the same -> increase headerIndex by one
      // because the current row has one cell fewer
      const headerIndex = (currLength === maxLength) ? index : index+1;

      // column label
      const allHeads = d3.select(table).select('thead').selectAll('th');
      const header = d3.select(allHeads[0][headerIndex]).select('div').select('span').text();

      const category = rowCategories.pop();
      const isColTask = category === row ? true : false;
      const cellData = d3.select(tableCell).datum() as IScoreCell;
      const scoreValue = isNumber(cellData.score.scoreValue) && !isNaN(cellData.score.scoreValue)  ? cellData.score.scoreValue.toFixed(3) : 'n/a';
      let scorePvalue : string|number = cellData.score.pValue;
      if(scorePvalue === -1) {
        scorePvalue = 'n/a';
      } else {
        scorePvalue = (scorePvalue as number).toExponential(3);
      }


      let tooltipText = '';
      if(isColTask) {
        tooltipText = `Column: ${header}\nRow: ${row}\nScore: ${scoreValue}\np-Value: ${scorePvalue}`;
      } else {
        tooltipText = `Data Column: ${row}\nColumn: ${header}\nRow: ${category}\nScore: ${scoreValue}\np-Value: ${scorePvalue}`;
      }

      return tooltipText;
    } else {
      // cell that have no p-values
      return null;
    }

  }


}

@TaskDecorator()
export class ColumnComparison extends ATouringTask {

  constructor() {
    super();
    this.id = 'colCmp';
    this.label = 'Columns';
    this.order = 20;
    this.icon = colCmpIcon;

    this.scope = SCOPE.ATTRIBUTES;
  }

  public initContent() {
    this.node.insertAdjacentHTML('beforeend', colCmpHtml);
    super.initContent();

    const headerDesc = d3.select(this.node).select('thead tr').select('th').classed('head-descr',true).append('header');
    headerDesc.append('h1').text('Similarity of Columns');
    headerDesc.append('p').text('Click on a p-Value in the table for details.');
  }


  public update(forceTableUpdate: boolean): void {
    const tableChanged = this.updateAttributeSelectors();
    if (forceTableUpdate || tableChanged) {
      this.updateTable();
    }
  }

  public updateAttributeSelectors(): boolean {
    // console.log('update selectors');
   const descriptions = this.getAttriubuteDescriptions();

    const attrSelectors = d3.select(this.node).selectAll('select.attr optgroup');
    const options = attrSelectors.selectAll('option').data(descriptions, (desc) => desc.label); // duplicates are filtered automatically
    options.enter().append('option').text((desc) => desc.label);

    let tableChanged = !options.exit().filter(':checked').empty(); //if checked attributes are removed, the table has to update

    const attrSelect1 =  d3.select(this.node).select('select.attr[name="attr1[]"]');
    if (attrSelect1.selectAll('option:checked').empty()) { // make a default selection
      attrSelect1.selectAll('option').each(function(desc, i) {(this as HTMLOptionElement).selected = i === descriptions.length-1 ? true : false ;}); // by default, select last column. set the others to null to remove the selected property
      tableChanged = true; // attributes have changed
    }

    const attrSelect2 = d3.select(this.node).select('select.attr[name="attr2[]"]');
    if (attrSelect2.selectAll('option:checked').empty()) { // make a default selection
      attrSelect2.selectAll('option').each(function() {(this as HTMLOptionElement).selected = true;}); // by default, select all
      tableChanged = true; // attributes have changed
    }

    options.exit().remove();
    options.order();

    super.updateSelect2();

    return tableChanged;
  }

  public updateTable() {
    // console.log('update table');
    WorkerManager.terminateAll(); // Abort all calculations as their results are no longer needed

    const timestamp = new Date().getTime().toString();
    d3.select(this.node).attr('data-timestamp', timestamp);


    let colData =  d3.selectAll('select.attr[name="attr1[]"] option:checked').data();
    let rowData = d3.selectAll('select.attr[name="attr2[]"]  option:checked').data();
    if(colData.length > rowData.length) {
      [rowData, colData] = [colData, rowData]; // avoid having more columns than rows --> flip table
    }

    const colHeads = d3.select(this.node).select('thead tr').selectAll('th.head').data(colData, (d) => d.column); // column is key
    const colHeadsSpan = colHeads.enter().append('th')
      .attr('class', 'head rotate').append('div').append('span').append('span'); //th.head are the column headers

    const that = this; // for the function below
    function updateTableBody(bodyData: Array<Array<Array<IScoreCell>>>) {
      if (d3.select(that.node).attr('data-timestamp') !== timestamp) {
        return; // skip outdated result
      }

      that.updateTableDescription(bodyData.length === 0);


      // create a table body for every column
      const bodies = d3.select(that.node).select('table').selectAll('tbody').data(bodyData, (d) => d[0][0].label); // the data of each body is of type: Array<Array<IScoreCell>>
      bodies.enter().append('tbody'); //For each IColumnTableData, create a tbody

      // the data of each row is of type: Array<IScoreCell>
      const trs = bodies.selectAll('tr').data((d) => d, (d) => d[0].label); // had to specify the function to derive the data (d -> d)
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d);
      tds.enter().append('td');
      // Set colheads in thead
      colHeadsSpan.html((d) => `<b>${d.label}</b>`);
      colHeadsSpan.attr('data-type',(d) => (d.type));
      // set data in tbody
      tds.attr('colspan', (d) => d.colspan);
      tds.attr('rowspan', (d) => d.rowspan);
      tds.style('color', (d) => d.foreground);
      tds.style('background-color', (d) => d.background);
      tds.attr('data-type', (d) => d.type);
      tds.classed('action', (d) => d.score !== undefined);
      tds.classed('score', (d) => d.measure !== undefined);
      tds.html((d) => d.label);
      tds.on('click', function() { that.onClick.bind(that)(this); });
      tds.on('mouseover', function() { that.onMouseOver.bind(that)(this,true); });
      tds.on('mouseout', function() { that.onMouseOver.bind(that)(this,false); });
      tds.attr('title',function() {  return that.createToolTip.bind(that)(this); });

      // Exit
      colHeads.exit().remove(); // remove attribute columns
      colHeads.order();
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
      bodies.exit().remove();
      trs.order();
      bodies.order();

      const svgWidth = 120 + 33 * colData.length; // calculated width for the svg and polygon

      d3.select(that.node).select('th.head.rotate svg').remove();
      d3.select(that.node).select('th.head.rotate') //select first
        .insert('svg', ':first-child')
        .attr('width',svgWidth)
        .attr('height',120)
        .append('polygon').attr('points', '0,0 '+svgWidth+',0 0,120'); // 120 is thead height, 45° rotation --> 120 is also width
    }

    this.getAttrTableBody(colData, rowData, true, null).then(updateTableBody); // initialize
    this.getAttrTableBody(colData, rowData, false, updateTableBody).then(updateTableBody); // set values
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  private async getAttrTableBody(colAttributes: IColumnDesc[], rowAttributes: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][][]) => void): Promise<Array<Array<Array<IScoreCell>>>> {
    const data = this.prepareDataArray(colAttributes, rowAttributes);

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      for (const [rowIndex, row] of rowAttributes.entries()) {
        const rowPromises = [];
        for (const [colIndex, col] of colAttributes.entries()) {
          const colIndexInRows = rowAttributes.indexOf(col);
          const rowIndexInCols = colAttributes.indexOf(row);

          if (row.label === col.label) {
            //identical attributes
            data[rowIndex][0][colIndex+1] = {label: '<span class="circle"/>', measure: null};
          } else if (rowIndexInCols >= 0 && colIndexInRows >= 0 && colIndexInRows < rowIndex) {
            // the row is also part of the column array, and the column is one of the previous rows
          } else {
            const measures = MethodManager.getMeasuresByType(Type.get(row.type), Type.get(col.type), SCOPE.ATTRIBUTES);
            if (measures.length > 0) { // start at
              const measure = measures[0]; // Always the first
              const data1 = this.ranking.getAttributeDataDisplayed((col as IServerColumn).column); //minus one because the first column is headers
              const data2 = this.ranking.getAttributeDataDisplayed((row as IServerColumn).column);
              const setParameters = {
                setA: data1,
                setADesc: col,
                setB: data2,
                setBDesc: row
              };

              const highlight : IHighlightData[] = [
                  {column: (row as IServerColumn).column, label: row.label},
                  {column: (col as IServerColumn).column, label: col.label}];

              //generate HashObject and hash value
              const hashObject = {
                ids : this.ranking.getDisplayedIds(),
                selection : this.ranking.getSelection(),
                row : {lable: (row as IServerColumn).label, column: (row as IServerColumn).column},
                column : {lable: (col as IServerColumn).label, column: (col as IServerColumn).column},
              };

              // remove selection ids, if both row and column are not 'Selection'
              if (hashObject.row.lable !== 'Selection' && hashObject.column.lable !== 'Selection') {
                delete hashObject.selection;
              }
              // sort the ids, if both row and column are not 'Rank'
              if (hashObject.row.lable !== 'Rank' && hashObject.column.lable !== 'Rank') {
                hashObject.ids = this.ranking.getDisplayedIds().sort();
              }

              // console.log('hashObject: ', hashObject, ' | unsortedSelction: ', this.ranking.getSelectionUnsorted());
              const hashObjectString = JSON.stringify(hashObject);
              // console.log('hashObject.srtringify: ', hashObjectString);
              const hashValue = XXH.h32(hashObjectString,0).toString(16);
              // console.log('Hash: ', hashValue);

              let isStoredScoreAvailable = false; //flag for the availability of a stored score

              rowPromises.push(new Promise<IMeasureResult>((resolve, reject) => {
                //get score from sessionStorage
                const sessionScore = sessionStorage.getItem(hashValue);
                // console.log('sessionScore: ', sessionScore);
                // score for the measure
                let score: Promise<IMeasureResult> = null;

                if(sessionScore === null || sessionScore === undefined || sessionScore.length === 2) {
                  score = measure.calc(data1, data2, null);
                } else if (sessionScore !== null || sessionScore !== undefined) {
                  score = Promise.resolve(JSON.parse(sessionScore)) as Promise<IMeasureResult>;
                  isStoredScoreAvailable = true;
                }

                // return score
                resolve(score);

                }).then((score) => {

                  if(!isStoredScoreAvailable) {
                    const scoreString = JSON.stringify(score);
                    // console.log('new score: ', score);
                    // console.log('new scoreString: ', scoreString);
                    sessionStorage.setItem(hashValue, scoreString);
                  }

                  data[rowIndex][0][colIndex+1] = this.toScoreCell(score, measure, setParameters, highlight);

                  if(rowIndexInCols >= 0 && colIndexInRows >= 0) {
                    //invert A and B so that the axis labels are conistent
                    const setParametersInverted = {
                      setA: setParameters.setB,
                      setADesc: setParameters.setBDesc,
                      setB: setParameters.setA,
                      setBDesc: setParameters.setADesc
                    };
                    data[colIndexInRows][0][rowIndexInCols+1] = this.toScoreCell(score, measure, setParametersInverted, highlight);
                  }
                }).catch((err) => {
                  console.error(err);
                  const errorCell = {label: 'err', measure};
                  data[rowIndex][0][colIndex+1] = errorCell;
                  if(rowIndexInCols >= 0 && colIndexInRows >= 0) {
                    data[colIndexInRows][0][rowIndexInCols + 1] = errorCell;
                  }
                })
              );


            }
          }
        }

        promises.concat(rowPromises);
        Promise.all(rowPromises).then(() => { update(data); this.updateSelectionAndVisuallization(row); });
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }

  prepareDataArray(colAttributes: IColumnDesc[], rowAttributes: IColumnDesc[]) {
    if(rowAttributes.length === 0 || colAttributes.length === 0) {
      return [];
    }
    const data = new Array(rowAttributes.length); // n2 arrays (bodies)
    for (const i of data.keys()) {
      data[i] = new Array(1); //currently just one row per attribute
      data[i][0] = new Array(colAttributes.length + 1).fill({label: '<i class="fa fa-circle-o-notch fa-spin"></i>', measure: null} as IScoreCell); // containing n1+1 elements (header + n1 vlaues)
      data[i][0][0] = {label: `<b>${rowAttributes[i].label}</b>`, type: rowAttributes[i].type};
    }

    return data;
  }
}


@TaskDecorator()
export class RowComparison extends ATouringTask {

  constructor() {
    super();
    this.id = 'rowCmp';
    this.label = 'Rows';
    this.order = 10;
    this.icon = rowCmpIcon;

    this.scope = SCOPE.SETS;
  }

  initContent() {
    this.node.insertAdjacentHTML('beforeend', rowCmpHtml);
    super.initContent();

    const headerDesc = d3.select(this.node).select('thead tr').select('th').classed('head-descr',true).append('header');
    headerDesc.append('h1').text('Difference of Rows');
    headerDesc.append('p').text('Click on a p-Value in the table for details.');

    d3.select(this.node).selectAll('select.rowGrp').each(function() { // Convert to select2
      $(this).data('placeholder', 'Select one or more groups of rows.');
    });
  }


  public update(forceTableUpdate: boolean): void {
    const tableChanged = this.updateSelectors();
    if (forceTableUpdate || tableChanged) {
      this.updateTable();
    }
  }

  private updateSelectors(): boolean {
    const descriptions = this.getAttriubuteDescriptions();

    // Update Row Selectors
    // Rows are grouped by categories, so we filter the categorical attributes:
    const catDescriptions = descriptions.filter((desc) => (desc as ICategoricalColumnDesc).categories);
    catDescriptions.forEach((catDescription) => {
      (catDescription as ICategoricalColumnDesc).categories.forEach((category) => {
        (category as IAttributeCategory).attribute = (catDescription as IServerColumn); // store the attribute taht the category belongs to
      });
    });

    // For each attribute, create a <optgroup>
    const rowSelectors = d3.select(this.node).selectAll('select.rowGrp');
    const optGroups = rowSelectors.selectAll('optgroup').data(catDescriptions, (desc) => desc.label);
    optGroups.enter().append('optgroup').attr('label', (desc) => desc.label);
    // For each category, create a <option> inside the optgroup
    const rowOptions = optGroups.selectAll('option').data((d: ICategoricalColumnDesc) => d.categories, (cat: ICategory) => cat.label);
    rowOptions.enter().append('option').text((cat: ICategory) => cat.label);

    let tableChanged = !rowOptions.exit().filter(':checked').empty(); //if checked categories are removed, the table has to update

    // Remove atribtues and categories that were removed and order the html elements
    rowOptions.exit().remove();
    rowOptions.order();
    optGroups.exit().remove();
    optGroups.order();

    rowSelectors.each(function() { // function to reference the <select> with 'this'
      const emptySelection = d3.select(this).selectAll('option:checked').empty();
      if (emptySelection) {
        d3.select(this).select('optgroup').selectAll('option').each(function() {(this as HTMLOptionElement).selected = true;}); // select the categories of the first attribute by default
        tableChanged = true;
      }
    });

    // Update Attribute Selectors
    const attrSelector = d3.select(this.node).select('select.attr optgroup');
    const attrOptions = attrSelector.selectAll('option').data(descriptions, (desc) => desc.label); // duplicates are filtered automatically
    attrOptions.enter().append('option').text((desc) => desc.label);

    tableChanged = tableChanged || !attrOptions.exit().filter(':checked').empty(); //if checked attributes are removed, the table has to update

    if (attrSelector.selectAll('option:checked').empty()) { // make a default selection
      attrSelector.selectAll('option').each(function() {(this as HTMLOptionElement).selected = true;}); // by default, select all columns.
      tableChanged = true; // attributes have changed
    }

    attrOptions.exit().remove();
    attrOptions.order();

    super.updateSelect2();

    return tableChanged;
  }


  updateTable() {
    WorkerManager.terminateAll(); // Abort all calculations as their results are no longer needed

    const timestamp = new Date().getTime().toString();
    d3.select(this.node).attr('data-timestamp', timestamp);

    let colGrpData = d3.select(this.node).selectAll('select.rowGrp[name="row1[]"] option:checked').data();
    let rowGrpData = d3.select(this.node).selectAll('select.rowGrp[name="row2[]"]  option:checked').data();

    if(colGrpData.length > rowGrpData.length) {
      [rowGrpData, colGrpData] = [colGrpData, rowGrpData]; // avoid having more columns than rows --> flip table
    }

    const rowAttrData = d3.select(this.node).selectAll('select.attr[name="attr[]"]  option:checked').data();
    const colHeadsCat = d3.select(this.node).select('thead tr').selectAll('th.head').data(colGrpData, (cat) => cat.attribute.column + ':' + cat.name); // cat.name != label; add column to handle identical category names
    const colHeadsCatSpan = colHeadsCat.enter().append('th')
      .attr('class', 'head rotate').append('div').append('span').append('span'); //th.head are the column headers

    const that = this; // for the function below
    function updateTableBody(bodyData: Array<Array<Array<IScoreCell>>>, timestamp: string) {
      if (d3.select(that.node).attr('data-timestamp') !== timestamp) {
        return; // skip outdated result
      }

      that.updateTableDescription(bodyData.length === 0);

      // create a table body for every column
      const bodies = d3.select(that.node).select('table').selectAll('tbody').data(bodyData, (d) => d[0][0].label); // the data of each body is of type: Array<Array<IScoreCell>>
      bodies.enter().append('tbody').classed('bottom-margin', true); //For each IColumnTableData, create a tbody

      // the data of each row is of type: Array<IScoreCell>
      const trs = bodies.selectAll('tr').data((d) => d, (d) => d[0].key); // had to specify the function to derive the data (d -> d)
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d);   // the data of each td is of type: IScoreCell
      tds.enter().append('td');

      // Set colheads in thead
      colHeadsCatSpan.text((d) => `${d.label} (${d.attribute.label})`);
      colHeadsCatSpan.each(function(d) {
        const parent = d3.select(this).node().parentNode; //parent span-element
        d3.select(parent).style('background-color', (d) => d && d.color ? d.color : '#FFF');
        let color = '#333333';
        if(d && d.color && 'transparent' !== d.color && d3.hsl(d.color).l < 0.5) { //transparent has lightness of zero
          color = 'white';
        }
        d3.select(parent.parentNode).style('color', color)
          .attr('title', (d) => `${d.label} (${d.attribute.label})`);
      });
      // set data in tbody
      tds.attr('colspan', (d) => d.colspan);
      tds.attr('rowspan', (d) => d.rowspan);
      tds.style('color', (d) => d.foreground);
      tds.style('background-color', (d) => d.background);
      tds.attr('data-type', (d) => d.type);
      tds.classed('action', (d) => d.score !== undefined);
      tds.classed('score', (d) => d.measure !== undefined);
      tds.html((d) => d.label);
      tds.on('click', function() { that.onClick.bind(that)(this); });
      tds.on('mouseover', function() { that.onMouseOver.bind(that)(this,true); });
      tds.on('mouseout', function() { that.onMouseOver.bind(that)(this,false); });
      tds.attr('title',function() {  return that.createToolTip.bind(that)(this); });

      // Exit
      tds.exit().remove(); // remove cells of removed columns
      colHeadsCat.exit().remove(); // remove attribute columns
      trs.exit().remove(); // remove attribute rows
      bodies.exit().remove();
      colHeadsCat.order();
      trs.order(); // Order the trs is important, if you have no items selected and then do select some, the select category would be at the bottom and the unselect category at the top of the table
      bodies.order();

      const svgWidth = 120 + 33 * colGrpData.length; // 120 height with 45° widht also 120, calculated width for the svg and polygon

      d3.select(that.node).select('th.head.rotate svg').remove();
      d3.select(that.node).select('th.head.rotate') //select first
        .insert('svg', ':first-child')
        .attr('width',svgWidth)
        .attr('height',120)
        .append('polygon').attr('points', '0,0 '+svgWidth+',0 0,120'); // 120 is thead height
    }

    this.getAttrTableBody(colGrpData, rowGrpData, rowAttrData, true, null).then((data) => updateTableBody(data, timestamp)); // initialize
    this.getAttrTableBody(colGrpData, rowGrpData, rowAttrData, false, (data) => updateTableBody(data, timestamp)).then((data) => updateTableBody(data, timestamp)); // set values
  }

  /**
   *     For each attribute in rowAttributes, we want to comapre the rows inside colGroups with the rows of rowGroups
   *     i.e. the number of table rows is: |rowAttributes| * |rowGroups|
   *     and there are |colGroups| columns
   *     + plus the rows and columns where we put labels
   *
   * @param colGroups
   * @param rowGroups
   * @param rowAttributes
   * @param scaffold only create the matrix with row headers, but no value calculation
   * @param update
   */
  async getAttrTableBody(colGroups: IAttributeCategory[], rowGroups: IAttributeCategory[], rowAttributes: IColumnDesc[] ,scaffold: boolean, update: (bodyData: IScoreCell[][][]) => void): Promise<Array<Array<Array<IScoreCell>>>> {
    const data = this.prepareDataArray(colGroups, rowGroups, rowAttributes);

    if (scaffold) {
      return data;
    } else {
      const promises = [];

      // the row and column indices stay the same, only the data changes ->  we want to retrieve these indices only once.
      const rowGrpsIndices = rowGroups.map((rowGrp) => this.ranking.getRowsWithCategory(rowGrp));
      const colGrpsIndices = colGroups.map((colGrp) => this.ranking.getRowsWithCategory(colGrp));
      // if a group is part of the column and row item groups, we use these array to get the correct index (so we can avoid duplicate calculations)
      const rowIndex4colGrp = colGroups.map((colGrp) => rowGroups.indexOf(colGrp));
      const colIndex4rowGrp = rowGroups.map((rowGrp) => colGroups.indexOf(rowGrp));

      for (const [bodyIndex, attr] of rowAttributes.entries()) {
        const attrPromises = [];
        const attrData = this.ranking.getAttributeDataDisplayed((attr as IServerColumn).column); //minus one because the first column is headers
        const measures = MethodManager.getMeasuresByType(Type.get(attr.type), Type.get(attr.type), SCOPE.SETS); // Always compare selected elements with a group of elements of the same column
        if (measures.length > 0) {
          const measure = measures[0];

          for (const [rowIndex, rowGrp] of rowGroups.entries()) {
            // Get the data of 'attr' for the rows inside 'rowGrp'
            const rowData = rowGrpsIndices[rowIndex].map((i) => attrData[i]);
            for (const [colIndex, colGrp] of colGroups.entries()) {
              const colIndexOffset = rowIndex === 0 ? 2 : 1; // Two columns if the attribute label is in the same line, (otherwise 1 (because rowspan))

              if (rowGrp.label === colGrp.label) { // identical groups
                data[bodyIndex][rowIndex][colIndexOffset + colIndex] = {label: '<span class="circle"/>', measure};
              } else if (colIndex4rowGrp[rowIndex] >= 0 && rowIndex4colGrp[colIndex] >= 0 && rowIndex4colGrp[colIndex] < rowIndex) {
                // the rowGrp is also part of the colGroups array, and the colGrp is one of the previous rowGroups --> i.e. already calculated in a table row above the current one
              } else {
                const colData = colGrpsIndices[colIndex].map((i) => attrData[i]);
                const setParameters = {
                  setA: rowData,
                  setADesc: attr,
                  setACategory: {label: `${rowGrp.label} (${rowGrp.attribute.label})`, color: rowGrp.color},
                  setB: colData,
                  setBDesc: attr,
                  setBCategory: {label: `${colGrp.label} (${colGrp.attribute.label})`, color: colGrp.color}
                };

                const highlight : IHighlightData[] = [
                    {column: (attr as IServerColumn).column, label: attr.label},
                    {column: rowGrp.attribute.column, label: rowGrp.attribute.label, category: rowGrp.name, color: rowGrp.color},
                    {column: colGrp.attribute.column, label: colGrp.attribute.label, category: colGrp.name, color: colGrp.color}];


                //generate HashObject and hash value
                const hashObject = {
                  ids : this.ranking.getDisplayedIds(),
                  selection : this.ranking.getSelection(),
                  attribute : {lable: (attr as IServerColumn).label, column: (attr as IServerColumn).column},
                  setACategory: rowGrp.label,
                  setBCategory: colGrp.label
                };

                // remove selection ids, if both categories and the data column are not selection
                if (hashObject.attribute.lable !== 'Selection' &&
                    hashObject.setACategory !== 'Unselected' && hashObject.setACategory !== 'Selected' &&
                    hashObject.setBCategory !== 'Unselected' && hashObject.setBCategory !== 'Selected') {
                  delete hashObject.selection;
                }
                // sort the ids, if the data column is not 'Rank'
                if (hashObject.attribute.lable !== 'Rank') {
                  hashObject.ids = this.ranking.getDisplayedIds().sort();
                }

                // console.log('hashObject: ', hashObject);
                const hashObjectString = JSON.stringify(hashObject);
                // console.log('hashObject.srtringify: ', hashObjectString);
                const hashValue = XXH.h32(hashObjectString,0).toString(16);
                // console.log('Hash: ', hash);

                let isStoredScoreAvailable = false; //flag for the availability of a stored score

                attrPromises.push(new Promise<IMeasureResult>((resolve, reject) => {
                  //get score from sessionStorage
                  const sessionScore = sessionStorage.getItem(hashValue);
                  // console.log('sessionScore: ', sessionScore);
                  // score for the measure
                  let score: Promise<IMeasureResult> = null;

                  if(sessionScore === null || sessionScore === undefined) {
                    score = measure.calc(rowData, colData, attrData);
                  } else if (sessionScore !== null || sessionScore !== undefined) {
                    score = Promise.resolve(JSON.parse(sessionScore)) as Promise<IMeasureResult>;
                    isStoredScoreAvailable = true;
                  }

                  // return score;
                  resolve(score);

                }).then((score) => {

                  if(!isStoredScoreAvailable) {
                    const scoreString = JSON.stringify(score);
                    // console.log('new score: ', score);
                    // console.log('new scoreString: ', scoreString);
                    sessionStorage.setItem(hashValue, scoreString);
                  }

                  data[bodyIndex][rowIndex][colIndexOffset + colIndex] = this.toScoreCell(score, measure, setParameters, highlight);
                    if(colIndex4rowGrp[rowIndex] >= 0 && rowIndex4colGrp[colIndex] >= 0) {
                      const colIndexOffset4Duplicate = rowIndex4colGrp[colIndex] === 0 ? 2 : 1; // Currenlty, we can't have duplicates in the first line, so this will always be 1
                      data[bodyIndex][rowIndex4colGrp[colIndex]][colIndexOffset4Duplicate + colIndex4rowGrp[rowIndex]] = this.toScoreCell(score, measure, setParameters, highlight);
                    }

                }).catch((err) => {
                  console.error(err);
                  const errorCell = {label: 'err', measure};
                  data[bodyIndex][rowIndex][colIndexOffset + colIndex] = errorCell;
                  if(colIndex4rowGrp[rowIndex] >= 0 && rowIndex4colGrp[colIndex] >= 0) {
                    const colIndexOffset4Duplicate = rowIndex4colGrp[colIndex] === 0 ? 2 : 1;
                    data[bodyIndex][rowIndex4colGrp[colIndex]][colIndexOffset4Duplicate + colIndex4rowGrp[rowIndex]] = errorCell;
                  }
                }));


              }
            }
          }
        }
        Promise.all(attrPromises).then(() => {update(data);this.updateSelectionAndVisuallization(attr);});
        promises.concat(attrPromises);
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }

  prepareDataArray(colGroups: IAttributeCategory[], rowGroups: IAttributeCategory[], rowAttributes: IColumnDesc[]) {
    if(colGroups.length === 0 || rowGroups.length === 0 || rowAttributes.length === 0) {
      return []; //return empty array, will cause an empty table
    }
    const data = new Array(rowAttributes.length); // one array per attribute (number of table bodies)

    for (const [i, attr] of rowAttributes.entries()) {
      data[i] = new Array(rowGroups.length); // one array per rowGroup (number of rows in body)
      for (const [j, rowGrp] of rowGroups.entries()) {
        data[i][j] = new Array(colGroups.length + (j === 0 ? 2 : 1)).fill({label: '<i class="fa fa-circle-o-notch fa-spin"></i>', measure: null} as IScoreCell);
        data[i][j][j === 0 ? 1 : 0] = { // through rowspan, this becomes the first array item
          label: `${rowGrp.label} (${rowGrp.attribute.label})`,
          background: rowGrp.color,
          foreground: textColor4Background(rowGrp.color)
        };

        if (j === 0) {
          data[i][j][0] = {
            label: `<b>${attr.label}</b>`,
            rowspan: rowGroups.length,
            type: attr.type
          };
        }

        data[i][j][0].key = `${attr.label}-${rowGrp.attribute.label}-${rowGrp.label}`;
      }
    }

    return data;
  }
}


interface IScoreCell {
  key?: string;
  label: string;
  type?: string;
  background?: string;
  foreground?: string;
  rowspan?: number;
  colspan?: number;
  score?: IMeasureResult;
  measure?: ISimilarityMeasure;
  setParameters?: ISetParameters;
  highlightData?: IHighlightData[];
}

interface IHighlightData {
    column: string; //attribute.column
    label: string;
    category?: string; // cat.name
    color?: string;
}


export function score2color(score:number) : {background: string, foreground: string} {
  let background ='#ffffff'; //white
  let foreground = '#333333'; //kinda black


  if(score <= 0.05) {
    // console.log('bg color cahnge')
    const calcColor = d3.scale.linear().domain([0, 0.05]).range(<any[]>['#000000', '#FFFFFF']);

    background = calcColor(score).toString();
    foreground = textColor4Background(background);
  }

  return {background, foreground};
}


export function textColor4Background(backgroundColor: string) {
  let color = '#333333';
  if ('transparent' !== backgroundColor && d3.hsl(backgroundColor).l < 0.5) { //transparent has lightness of zero
    color =  'white';
  }

  return color;
}
