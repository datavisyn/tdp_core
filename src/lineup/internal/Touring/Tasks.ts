import {IServerColumn} from '../../../rest';
import {RankingAdapter} from './RankingAdapter';
import {MethodManager, IMeasureResult, ISimilarityMeasure, IMeasureVisualization, ISetParameters, Type, SCOPE, WorkerManager} from 'touring';
import {IColumnDesc, ICategory} from 'lineupjs';
import * as d3 from 'd3';
import { cell } from 'phovea_core/src/range';


export const tasks = new Array<ATouringTask>();
export function TaskDecorator() {
  return function (target: {new(): ATouringTask}) { // only instantiable subtypes of ATouringTask can be passed.
    tasks.push(new target());
    tasks.sort((a, b) => b.order - a.order); //sort descending
  };
}


export interface ITouringTask {
  id: string;
  label: string;

  scope: SCOPE; // Does the Task use attributes or subsets of them?
}

export abstract class ATouringTask implements ITouringTask {
  public id: string;
  public label: string;
  public node: HTMLElement;

  public scope: SCOPE;

  public order: number = 0; // order of the tasks, the higher the more important

  ranking: RankingAdapter;

  public abort() {
    WorkerManager.terminateAll();
  }

  public init(ranking: RankingAdapter, node: HTMLElement) {
    this.ranking = ranking;
    this.node = d3.select(node).append('div').attr('class', `task ${this.id}`).node() as HTMLElement;
    this.initContent();
  }

  initContent() {
    let headline = 'Similarity of ';
    if (SCOPE.ATTRIBUTES === this.scope) {
      headline += 'Columns';
    } else {
      headline += ' Rows';
    }
    d3.select(this.node).append('h1').text(headline);

    const tablesEnter = d3.select(this.node).append('table');

    //Table Head
    tablesEnter.append('thead').append('tr').append('th');

    //Table Body
    //Table Body --> no table body, we create multiple bodies below (one for each column to group it's categories (rows in the table))

    //add legend for the p-values
    this.createLegend(d3.select(this.node));
    //add div for the detail (detail text and visualisation)
    d3.select(this.node).append('div').classed('details', true);
  }

  public abstract update(data: any[]);
  // {
  //     const ps = d3.select(this.node).selectAll('p').data(data, (data) => data.column); //column property is key
  //     ps.enter().append('p').text((attr) => attr.label); //enter: add tasks to dropdown
  //     // update: nothing to do
  //     ps.exit().remove();   // exit: remove tasks no longer displayed
  //     ps.order();           // order domelements as in the array
  // }

  toScoreCell(score: IMeasureResult, measure :ISimilarityMeasure, setParameters: ISetParameters): IScoreCell {
    let color =  score2color(score.pValue);
    let cellLabel = score.pValue.toFixed(3);

    cellLabel = cellLabel.substring(1); //remove leading 0
    if(score.pValue > 0.1) {
      cellLabel = '';
    }
    if(score.pValue === -1) {
      cellLabel = '-';
      color = {
        background: '#ffffff', //white
        foreground: '#333333' //kinda black
      };
    }
    return {
      label: cellLabel,
      background: color.background,
      foreground: color.foreground,
      score,
      measure,
      setParameters
    };
  }

  // creates legend for the p-value
  private createLegend(parentElement: d3.Selection<any>) {
    const divLegend = parentElement.append('div').classed('measure-legend',true);

    const svgLegendContainer = divLegend.append('svg')
                              .attr('width','100%')
                              .attr('height',35);
                              // .attr('viewBox','0 0 100% 35')
                              // .attr('preserveAspectRatio','xMaxYMin meet');

                              const svgDefs = svgLegendContainer.append('defs').append('linearGradient')
                                                  .attr('id','gradLegend');
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
      .style('fill','url(#gradLegend)');
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

  }

  protected removeOldVisuallization () {

    // remove old visualization and details
    const divDetails = d3.select(this.node).select('div.details');
    divDetails.selectAll('div').remove();
    divDetails.selectAll('svg').remove();

    // remove selected cell highlighting
    const allTds = d3.select(this.node).selectAll('td');
    allTds.classed('selectedCell',false);

  }

  private generateVisualDetails (miniVisualisation: d3.Selection<any>, measure: ISimilarityMeasure, measureResult: IMeasureResult) {

    const divDetailInfo = miniVisualisation.append('div')
                                    .classed('detailVis',true);

    // const detailTestValue = divDetailInfo.append('div');
    const scoreValue = measureResult.scoreValue.toFixed(3);
    const pValue = measureResult.pValue.toFixed(3);
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

    // const detailTestDescr = divDetailInfo.append('div');
    divDetailInfo.append('div')
                  .classed('detailDiv',true)
                  .text('Description: ')
                  .append('span')
                  .text(measure.description);
  }

  onClick(tableCell) {
    const cellData = d3.select(tableCell).datum();
    console.log('Cell click - data: ',cellData);

    // remove bg highlighting from all tds
    d3.select(this.node).selectAll('td').classed('selectedCell', false);

    // remove all old details
    const details = d3.select(this.node).select('div.details');
    details.selectAll('*').remove(); // avada kedavra outdated details!


    if (cellData.score) { //Currenlty only cells with a score are calculated (no category or attribute label cells)
      // Color table cell
      d3.select(this.node).selectAll('td').classed('selectedCell', false); // remove gb highlighting from all the other tds
      d3.select(tableCell).classed('selectedCell', true); // add bg highlighting

      const reusltScore : IMeasureResult = cellData.score;
      const measure : ISimilarityMeasure = cellData.measure;

      // Display details
      if(measure) {
        this.generateVisualDetails(details,measure,reusltScore); //generate description into details div
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

  onMouseOver(tableCell, state: boolean) {
    if(d3.select(tableCell).classed('score')) {

      const tr = d3.select(tableCell).node().parentNode;
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

      const tbody = d3.select(tr).node().parentNode; //current body
      const table = d3.select(tbody).node().parentNode; //current table

      // highlight row
      // d3.select(tr).select('td').classed('cross-selection',state);
      // highlight the first cell in the first for of a body with rowspan
      d3.select(tbody).select('tr').select('td').classed('cross-selection',state);

      // highlight column
      const allBodies = d3.select(table).selectAll('tbody');
      // console.log('allBodies : ',allBodies);

      // go through all bodies
      // for(const currBody of allBodies[0]) {
      //   const currRows = d3.select(currBody).selectAll('tr');
      //   // go through all rows of current body
      //   for(const currRow of currRows[0]) {
      //     // get all cells of current row and highlight
      //     const currCells = d3.select(currRow).selectAll('td');
      //     // calc the index for the cell which should be highlighted
      //     const currCellsLen = currCells[0].length;
      //     let currIndex = index;
      //     if (currCellsLen > currLength) {
      //       currIndex = index+1;
      //     } else if (currCellsLen < currLength) {
      //       currIndex = index-1;
      //     }
      //     // highlight cell of current body and current row
      //     d3.select(currCells[0][currIndex]).classed('cross-selection',state);
      //   }
      // }

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
    }
  }
}



// No decorator as i don't want it in the dropdown
export abstract class RowComparison extends ATouringTask {

  constructor() {
    super();
    this.id = 'itemCmp';
    this.label = 'Pairwise Compare Rows';

    this.scope = SCOPE.SETS;
  }

  initContent() {
    super.initContent();

    d3.select(this.node).select('table thead tr').append('th'); //Append another th for the category/group labels
  }
}

@TaskDecorator()
export class SelectionStratificationComparison extends RowComparison {

  constructor() {
    super();
    this.id = 'selStratCmp';
    this.label = 'Compare Selected Rows with Stratification Groups';
    this.order = 80;
  }

  update(data: any) {
    WorkerManager.terminateAll(); // Abort all calculations as their results are no longer needed
    // numerical and categorical data is ok
    const compareTo = [this.ranking.getSelectionDesc()];
    this.removeOldVisuallization();
    this.createTable(data, compareTo);
  }

  createTable(catData: any[], compareTo: {categories: ICategory[]; label: string; type: string; column: string;}[]): any {
    const timestamp = new Date().getTime().toString();
    d3.select(this.node).attr('data-timestamp', timestamp);

    const colHeadsCat = d3.select(this.node).select('thead tr').selectAll('th.head').data([].concat(...compareTo.map((attr)  => attr.categories)), (cat) => cat.name); // cat.name != label
    const colHeadsCatSpan = colHeadsCat.enter().append('th')
      .attr('class', 'head rotate').append('div').append('span').append('span'); //th.head are the column headers

    const that = this; // for the function below
    function updateTableBody(bodyData: Array<Array<Array<IScoreCell>>>, timestamp: string) {
      if (d3.select(that.node).attr('data-timestamp') !== timestamp) {
        return; // skip outdated result
      }

      // create a table body for every column
      const bodies = d3.select(that.node).select('table').selectAll('tbody').data(bodyData, (d) => d[0][0].label); // the data of each body is of type: Array<Array<IScoreCell>>
      bodies.enter().append('tbody').classed('bottom-margin', true); //For each IColumnTableData, create a tbody

      // the data of each row is of type: Array<IScoreCell>
      const trs = bodies.selectAll('tr').data((d) => d, (d) => d[0].key); // had to specify the function to derive the data (d -> d)
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d);   // the data of each td is of type: IScoreCell
      tds.enter().append('td');

      // Set colheads in thead
      colHeadsCatSpan.text((d) => d.label);
      // colHeadsCatSpan.style('background-color', (d) => d && d.color ? d.color : '#FFF');
      // colHeadsCatSpan.style('color', (d) => d && d.color ? textColor4Background(d.color) : '#333');
      colHeadsCatSpan.each(function(d) {
        const parent = d3.select(this).node().parentNode; //parent span-element
        d3.select(parent).style('background-color', (d) => d && d.color ? d.color : '#FFF');
        let color = '#333333';
        if(d && d.color && 'transparent' !== d.color && d3.hsl(d.color).l < 0.5) { //transparent has lightness of zero
          color = 'white';
        }
        d3.select(parent).style('color', color);
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
      // Exit
      tds.exit().remove(); // remove cells of removed columns
      colHeadsCat.exit().remove(); // remove attribute columns
      trs.exit().remove(); // remove attribute rows
      bodies.exit().remove();
      colHeadsCat.order();
      trs.order(); // Order the trs is important, if you have no items selected and then do select some, the select category would be at the bottom and the unselect category at the top of the table
      bodies.order();
    }

    this.getAttrTableBody(compareTo, catData, true, null).then((data) => updateTableBody(data, timestamp)); // initialize
    this.getAttrTableBody(compareTo, catData, false, (data) => updateTableBody(data, timestamp)).then((data) => updateTableBody(data, timestamp)); // set values
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][][]) => void): Promise<Array<Array<Array<IScoreCell>>>> {
    const allCat1 = [].concat(...attr1.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const groupedData = this.ranking.getGroupedData();
    const data = this.prepareDataArray(allCat1, groupedData, attr2);

    if (scaffold) {
      return data;
    } else {
      const promises = [];

      for (const [bodyIndex, col] of attr2.entries()) {
        const colPromises = [];
        const measures = MethodManager.getMeasuresByType(Type.get(col.type), Type.get(col.type), SCOPE.SETS); // Always compare selected elements with a group of elements of the same column
        if (measures.length > 0) {
          const measure = measures[0];
          //prepare data (selected data is the same for all groups of this column)
          const allData = this.ranking.getItemsDisplayed();
          const dataSelected = []; // TODO: hardcoded -> bad
          const dataUnselected = []; // TODO: hardcoded -> bad
          const selectIndices = this.ranking.getSelection();

          for (const [index, item] of allData.entries()) { // Walk through the array once an populate the data arrays
            const colId = (col as IServerColumn).column;
            if (selectIndices.length > 0 &&  (selectIndices.indexOf(index) !== -1)) {
              dataSelected.push(item[colId]);
            } else {
              dataUnselected.push(item[colId]);
            }
          }


          for (const [rowIndex, grpData] of groupedData.entries()) {
            const grpData4Col = grpData.rows.map((row) => row[(col as IServerColumn).column]);

            const scopedBodyIndex = bodyIndex; // by declaring it in this block, it is scoped and we don't need a closure to have the right value in the promise
            // Score with selected:
            const firstScoreIndex = rowIndex === 0 ? 2 : 1; //rows with attribute label have a 2 items, others just 1 item before the first score
            if(allCat1.indexOf('Selected') >= 0) { // ensure that there is a column
              const selScoreIndex = firstScoreIndex + allCat1.indexOf('Selected');
              const setParameters = {
                setA: dataSelected,
                setADesc: attr1[0],
                setACategory: 'Selected',
                setB: grpData4Col,
                setBDesc: col,
                setBCategory: groupedData[rowIndex]
              };
              colPromises.push(measure.calc(dataSelected, grpData4Col, dataSelected.concat(dataUnselected))
                    .then((score) => {
                      data[scopedBodyIndex][rowIndex][selScoreIndex] = this.toScoreCell(score, measure, setParameters);
                    })
                    .catch((err) => data[scopedBodyIndex][rowIndex][selScoreIndex] = {label: 'err'} ));
            }

            if(allCat1.indexOf('Unselected') >= 0) {  // ensure that there is a column
              const unselScoreIndex = firstScoreIndex + allCat1.indexOf('Unselected');
              const setParameters = {
                setA: dataUnselected,
                setADesc: attr1[0],
                setACategory: 'Unselected',
                setB: grpData4Col,
                setBDesc: col,
                setBCategory: groupedData[rowIndex]
              };
              // Score with unselected:
              colPromises.push(measure.calc(dataUnselected, grpData4Col, dataSelected.concat(dataUnselected))
                    .then((score) => {
                      data[scopedBodyIndex][rowIndex][unselScoreIndex] = this.toScoreCell(score, measure, setParameters);
                    })
                    .catch((err) => data[scopedBodyIndex][rowIndex][unselScoreIndex] = {label: 'err'}));
            }
          }
        }
        Promise.all(colPromises).then(() => update(data));
        promises.concat(colPromises);
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }

  prepareDataArray(allCat1: any[], groupedData: any[], attr2: IColumnDesc[]) {
    const data: Array<Array<Array<IScoreCell>>> = new Array(attr2.length); // An array for each attribute (n*tbody)
    for (const [i, col] of attr2.entries()) {
        data[i] = new Array(groupedData.length); // An array for each group (m * tr; comparison to stratification (all columns have the same groups))

        for (const [j, grp] of groupedData.entries()) {
          data[i][j] = new Array(allCat1.length + (j === 0 ? 2 : 1)).fill({label: '<i class="fa fa-circle-o-notch fa-spin"></i>', measure: null} as IScoreCell);
          data[i][j][j === 0 ? 1 : 0] = { // through rowspan, the group labels can become the first array item
            label: grp.label,
            background: grp.color,
            foreground:  textColor4Background(grp.color)
          };

          if (j === 0) {
            data[i][j][0] = {
              label: col.label,
              rowspan: groupedData.length,
              type: col.type
            };
          }
          data[i][j][0].key = col.label+'-'+grp.name;
        }
    }

    return data;
  }
}


@TaskDecorator()
export class SelectionCategoryComparison extends SelectionStratificationComparison {

  constructor() {
    super();
    this.id = 'selCatCmp';
    this.label = 'Compare Selected Rows with Column Categories';
    this.order = 100;
  }

  public update(data: any[]) {
    const catData = data.filter((attr) => attr.type === 'categorical');
    super.update(catData);
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][][]) => void): Promise<Array<Array<Array<IScoreCell>>>> {
    const allCat1 = [].concat(...attr1.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const data = this.prepareDataArray(allCat1, attr2);

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      const measure = MethodManager.getMeasuresByType(Type.CATEGORICAL, Type.CATEGORICAL, SCOPE.SETS)[0]; // fixed for this task: we compare categories to groups of items of the same column --> always categorical

      for (const [bodyIndex, col] of attr2.entries()) {
        const colPromises = [];
        for (const [rowIndex, cat] of (col as any).categories.entries()) {
          const allData = this.ranking.getItemsDisplayed();
          const dataCategory = [];
          const dataSelected = []; // TODO: hardcoded -> bad
          const dataUnselected = []; // TODO: hardcoded -> bad
          const selectIndices = this.ranking.getSelection();

          for (const [index, item] of allData.entries()) { // Walk through the array once an populate the data arrays
            const colId = (col as IServerColumn).column;
            if (item[colId] === cat.name) { // TODO what else can we do here if the value is not the column name?
              dataCategory.push(item[colId]);
            }

            if (selectIndices.length > 0 &&  (selectIndices.indexOf(index) !== -1)) {
              dataSelected.push(item[colId]);
            } else {
              dataUnselected.push(item[colId]);
            }
          }

          const scopedBodyIndex = bodyIndex; // by declaring it in this block, it is scoped and we don't need a closure to have the right value in the promise
          // Score with selected:
          const firstScoreIndex = rowIndex === 0 ? 2 : 1; //rows with attribute label have a 2 items, others just 1 item before the first score
          if(allCat1.indexOf('Selected') >= 0) { // ensure that there is a column
            const selScoreIndex = firstScoreIndex + allCat1.indexOf('Selected');
            const setParameters = {
              setA: dataSelected,
              setADesc: attr1[0],
              setACategory: 'Selected',
              setB: dataCategory,
              setBDesc: col,
              setBCategory: cat.name
            };
            colPromises.push(measure.calc(dataSelected, dataCategory, dataSelected.concat(dataUnselected))
                  .then((score) => {
                    data[scopedBodyIndex][rowIndex][selScoreIndex] = this.toScoreCell(score,measure,setParameters);
                  })
                  .catch((err) => data[scopedBodyIndex][rowIndex][selScoreIndex] = {label: 'err'}));
          }

          if(allCat1.indexOf('Unselected') >= 0) {  // ensure that there is a column
            const unselScoreIndex = firstScoreIndex + allCat1.indexOf('Unselected');
            const setParameters = {
              setA: dataUnselected,
              setADesc: attr1[0],
              setACategory: 'Unselected',
              setB: dataCategory,
              setBDesc: col,
              setBCategory: cat.name
            };
            // Score with unselected:
            colPromises.push(measure.calc(dataUnselected, dataCategory, dataSelected.concat(dataUnselected))
                    .then((score) => {
                      data[scopedBodyIndex][rowIndex][unselScoreIndex] = this.toScoreCell(score,measure,setParameters);
                    })
                  .catch((err) => data[scopedBodyIndex][rowIndex][unselScoreIndex] = {label: 'err'}));
          }
        }
        Promise.all(colPromises).then(() => update(data));
        promises.concat(colPromises);
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }


  prepareDataArray(allCat1: any[], attr2: IColumnDesc[]) {
    const data = new Array(attr2.length); // one array per attribute (number of table bodies)
    for (const [i, col] of attr2.entries()) {
      data[i] = new Array((col as any).categories.length); // one array per category (number of rows in body)
      for (const [j, cat] of (col as any).categories.entries()) {
        data[i][j] = new Array(allCat1.length + (j === 0 ? 2 : 1)).fill({label: '<i class="fa fa-circle-o-notch fa-spin"></i>', measure: null} as IScoreCell);
        data[i][j][j === 0 ? 1 : 0] = { // through rowspan, this becomes the first array item
          label: cat.label,
          background: cat.color,
          foreground: textColor4Background(cat.color)
        };

        if (j === 0) {
          data[i][j][0] = {
            label: col.label,
            rowspan: (col as any).categories.length,
            type: col.type
          };
        }
        data[i][j][0].key = col.label+'-'+cat.label;
      }
    }

    return data;
  }
}

@TaskDecorator()
export class PairwiseStratificationComparison extends SelectionStratificationComparison {

  constructor() {
    super();
    this.id = 'pairStratCmp';
    this.label = 'Compare Stratification Groups Pairwise';
    this.order = 60;
  }

  update(data: any) {
    // numerical and categorical data is ok
    const compareTo = [this.ranking.getStratificationDesc()];
    this.removeOldVisuallization();
    this.createTable(data, compareTo);
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][][]) => void): Promise<Array<Array<Array<IScoreCell>>>> {
    const allCat1 = [].concat(...attr1.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const groupedData = this.ranking.getGroupedData();
    const data = this.prepareDataArray(allCat1, groupedData, attr2);

    if (scaffold) {
      return data;
    } else {
      const promises = [];

      for (const [bodyIndex, col] of attr2.entries()) {
        const colPromises = [];
        const measures = MethodManager.getMeasuresByType(Type.get(col.type), Type.get(col.type), SCOPE.SETS); // Always compare selected elements with a group of elements of the same column
        if (measures.length > 0) {
          const measure = measures[0];
          for (const [rowIndex, grpData] of groupedData.entries()) {
            const grpData4ColRow = grpData.rows.map((row) => row[(col as IServerColumn).column]); //data for the current row
            const scopedBodyIndex = bodyIndex; // by declaring it in this block, it is scoped and we don't need a closure to have the right value in the promise
            const firstScoreIndex = rowIndex === 0 ? 2 : 1; //rows with attribute label have a 2 items, others just 1 item before the first score

            for (const [k, grpData] of groupedData.entries()) {
              const colIndex = firstScoreIndex + k;
              if(k < rowIndex) { // only diagonal
                const grpData4ColCol = grpData.rows.map((row) => row[(col as IServerColumn).column]); //data for the current column
                const setParameters = {
                  setA: grpData4ColCol,
                  setADesc: col,
                  setACategory: groupedData[k],
                  setB: grpData4ColRow,
                  setBDesc: col,
                  setBCategory: groupedData[rowIndex],
                };
                colPromises.push(measure.calc(grpData4ColRow, grpData4ColCol, this.ranking.getAttributeDataDisplayed((col as IServerColumn).column))
                  .then((score) => {
                    data[scopedBodyIndex][rowIndex][colIndex] = this.toScoreCell(score,measure,setParameters);
                    const mirrorRowIndex = colIndex - firstScoreIndex; //remove number of cell labels
                    const firstCol = rowIndex === 0 ? 2 : 1; //define index of first column for each row
                    const mirrorFirstScoreIndex = colIndex === firstCol ? 2 : 1; //number of attribute label for a row
                    const mirrorColIndec = rowIndex + mirrorFirstScoreIndex; //add number of label cells as offset
                    const mirrorSetParameters = {
                      setA: setParameters.setB,
                      setADesc: setParameters.setBDesc,
                      setACategory: setParameters.setBCategory,
                      setB: setParameters.setA,
                      setBDesc: setParameters.setADesc,
                      setBCategory: setParameters.setACategory
                    };
                    data[scopedBodyIndex][mirrorRowIndex][mirrorColIndec] = this.toScoreCell(score,measure,mirrorSetParameters);
                  })
                  .catch((err) => data[scopedBodyIndex][rowIndex][colIndex] = {label: 'err'}));
              } else if (k === rowIndex) {
                data[scopedBodyIndex][rowIndex][colIndex] = {label: '&#x26AB', measure};
              }
            }
          }
        }
        promises.concat(colPromises);
        Promise.all(colPromises).then(() => update(data));
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
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

@TaskDecorator()
export class ColumnComparison extends ATouringTask {

  constructor() {
    super();
    this.id = 'attrCmp';
    this.label = 'Compare Columns Pairwise';
    this.order = 20;

    this.scope = SCOPE.ATTRIBUTES;
  }

  public update(data: any[]) {
    WorkerManager.terminateAll(); // Abort all calculations as their results are no longer needed
    const timestamp = new Date().getTime().toString();
    d3.select(this.node).attr('data-timestamp', timestamp);

    this.removeOldVisuallization();

    const colHeads = d3.select(this.node).select('thead tr').selectAll('th.head').data(data, (d) => d.column); // column is key
    const colHeadsSpan = colHeads.enter().append('th')
      .attr('class', 'head rotate').append('div').append('span').append('span'); //th.head are the column headers

    const that = this; // for the function below
    function updateTableBody(bodyData: Array<Array<Array<IScoreCell>>>) {
      if (d3.select(that.node).attr('data-timestamp') !== timestamp) {
        return; // skip outdated result
      }

      const test = bodyData.slice();
      // console.log(test)
      // create a table body for every column
      const bodies = d3.select(that.node).select('table').selectAll('tbody').data(bodyData, (d) => d[0][0].label); // the data of each body is of type: Array<Array<IScoreCell>>
      bodies.enter().append('tbody'); //For each IColumnTableData, create a tbody

      // the data of each row is of type: Array<IScoreCell>
      const trs = bodies.selectAll('tr').data((d) => d, (d) => d[0].label); // had to specify the function to derive the data (d -> d)
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d);
      tds.enter().append('td');
      // Set colheads in thead
      console.log('colHeadsCat: ',colHeads);
      colHeadsSpan.text((d) => d.label);
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

      // Exit
      colHeads.exit().remove(); // remove attribute columns
      colHeads.order();
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
      bodies.exit().remove();
      trs.order();
      bodies.order();
    }

    this.getAttrTableBody(data, data, true, null).then(updateTableBody); // initialize
    this.getAttrTableBody(data, data, false, updateTableBody).then(updateTableBody); // set values
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  private async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][][]) => void): Promise<Array<Array<Array<IScoreCell>>>> {
    const data = this.prepareDataArray(attr1, attr2);

    //TODO This method assumes attr1 and attr2 contain the same attribues and are ordered in the same way (cells are skipped based on index not on label match or whatever)
    if (attr1 !== attr2) {
      throw Error('This method can not handle two different arrays');
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      for (const [bodyIndex, rows] of data.entries()) {
        const colPromises = [];
        for (const row of rows) {
          for (const colIndex of row.keys()) { // just one row so I directly index it here
            if (colIndex > 0) {
              const measures = MethodManager.getMeasuresByType(Type.get(attr1[colIndex - 1].type), Type.get(attr2[bodyIndex].type), SCOPE.ATTRIBUTES);
              if (measures.length > 0 && colIndex <= bodyIndex) { // start at
                const measure = measures[0]; // Always the first
                const data1 = this.ranking.getAttributeDataDisplayed((attr1[colIndex - 1]as IServerColumn).column); //minus one because the first column is headers
                const data2 = this.ranking.getAttributeDataDisplayed((attr2[bodyIndex] as IServerColumn).column);
                const setParameters = {
                  setA: data1,
                  setADesc: attr1[colIndex - 1],
                  setB: data2,
                  setBDesc: attr2[bodyIndex]
                };
                colPromises.push(measure.calc(data1, data2, null) //allData is not needed here, data1 and data2 contain all items of the attributes.
                .then((score) => {
                  row[colIndex] = this.toScoreCell(score,measure,setParameters);
                  const mirrorSetParameters = {
                    setA: setParameters.setB,
                    setADesc: setParameters.setBDesc,
                    setB: setParameters.setA,
                    setBDesc: setParameters.setADesc
                  };

                  data[colIndex-1][0][bodyIndex+1] = this.toScoreCell(score,measure,mirrorSetParameters);
                })
                  .catch((err) => row[colIndex] = {label: 'err'})
                ); // if you 'await' here, the calculations are done sequentially, rather than parallel. so store the promises in an array
              }
            }
          }
        }
        promises.concat(colPromises);
        Promise.all(colPromises).then(() => update(data));
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }

  prepareDataArray(attr1: IColumnDesc[], attr2: IColumnDesc[]) {
    const data = new Array(attr2.length); // n2 arrays (bodies)
    for (const i of data.keys()) {
      data[i] = new Array(1); //currently just one row
      data[i][0] = new Array(attr1.length + 1).fill({label: '<i class="fa fa-circle-o-notch fa-spin"></i>', measure: null} as IScoreCell); // containing n1+1 elements (header + n1 vlaues)
      data[i][0][0] = {label: `<b>${attr2[i].label}</b>`, type: attr2[i].type};
      data[i][0][i+1] = {label: '&#x26AB', measure: null};
      // for (let j=i+2; j<data[i][0].length; j++) { //half of the table stays empty
      //   data[i][0][j] = { label: '', measure: null}; // empty (not null, because null will display spinning wheel)
      // }
    }

    return data;
  }
}


export function textColor4Background(backgroundColor: string) {
  let color = '#333333';
  if ('transparent' !== backgroundColor && d3.hsl(backgroundColor).l < 0.5) { //transparent has lightness of zero
    color =  'white';
  }

  return color;
}
