import {IServerColumn} from '../../../../rest';
import {RankingAdapter} from '../RankingAdapter';
import {MethodManager, IMeasureResult, ISimilarityMeasure, IMeasureVisualization, ISetParameters, Type, SCOPE, WorkerManager} from 'touring';
import {IColumnDesc, ICategory, Column, CategoricalColumn, ICategoricalColumnDesc, LocalDataProvider} from 'lineupjs';
import * as d3 from 'd3';
import colCmpHtml from 'html-loader!./ColumnComparison.html'; // webpack imports html to variable
import rowCmpHtml from 'html-loader!./RowComparison.html'; // webpack imports html to variable

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
  public static EVENTTYPE = '.touringTask';
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
    this.addEventListeners();
  }

  initContent() {
    //add legend for the p-values
    this.createLegend(d3.select(this.node).select('div.legend'));
  }


  private addEventListeners() {
    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores
    //  if no items are selected, the table should be displayed by a message
    this.ranking.getProvider().on(LocalDataProvider.EVENT_SELECTION_CHANGED + ATouringTask.EVENTTYPE, () => this.update()); //fat arrow to preserve scope in called function (this)

    // column of a table was added
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores
    this.ranking.getProvider().on(LocalDataProvider.EVENT_ADD_COLUMN + ATouringTask.EVENTTYPE, () => this.update());

    // column of a table was removed
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores
    this.ranking.getProvider().on(LocalDataProvider.EVENT_REMOVE_COLUMN + ATouringTask.EVENTTYPE, () => this.update());

    // for filter changes and stratification changes
    //  After the number of items has changed, the score change aswell
    // If the stratification changes, the "Stratification" attribute and possibly the table has to be changed
    this.ranking.getProvider().on(LocalDataProvider.EVENT_ORDER_CHANGED + ATouringTask.EVENTTYPE, () => this.update());
  }

  public abstract update();


  getAttriubuteDescriptions(): IColumnDesc[] {
    let descriptions: IColumnDesc[] = this.ranking.getDisplayedAttributes().map((col: Column) => {
      const displayedCategories = this.ranking.getAttributeCategoriesDisplayed((col.desc as IServerColumn).column);
      const desc: IColumnDesc = deepCopy(col.desc);
      if ((col as CategoricalColumn).categories) {
        (desc as ICategoricalColumnDesc).categories = deepCopy((col as CategoricalColumn).categories).filter((category) => displayedCategories.has(category.name));
      }

      return desc;
    });

    const validTypes = ['categorical', 'number'];
    descriptions = descriptions.filter((desc) => validTypes.includes(desc.type)); // filter attributes by type
    descriptions.unshift(this.ranking.getSelectionDesc());
    descriptions.unshift(this.ranking.getRankDesc());
    return descriptions;
  }

  toScoreCell(score: IMeasureResult, measure :ISimilarityMeasure, setParameters: ISetParameters): IScoreCell {
    let color =  score2color(score.pValue);
    let cellLabel = score.pValue.toFixed(3);

    cellLabel = cellLabel.substring(1); //remove leading 0
    if(cellLabel > 0.1) {
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
}

@TaskDecorator()
export class ColumnComparison extends ATouringTask {

  constructor() {
    super();
    this.id = 'colCmp';
    this.label = 'Columns';
    this.order = 20;

    this.scope = SCOPE.ATTRIBUTES;
  }

  public initContent() {
    this.node.insertAdjacentHTML('beforeend', colCmpHtml);
    super.initContent();

    d3.select(this.node).selectAll('select').on('input', () => this.updateTable());
  }

  public update() {
    this.updateAttributeSelectors();
  }

  public updateAttributeSelectors() {
   const descriptions = this.getAttriubuteDescriptions();

    const attrSelectors = d3.select(this.node).selectAll('select.attr');
    const options = attrSelectors.selectAll('option').data(descriptions, (desc) => desc.label); // duplicates are filtered automatically
    options.enter().append('option').text((desc) => desc.label);

    let updateTable = !options.exit().filter(':checked').empty(); //if checked attributes are removed, the table has to update

    const attrSelect1 =  d3.select(this.node).select('select.attr[name="attr1[]"]');
    if (attrSelect1.selectAll('option:checked').empty()) { // make a default selection
      attrSelect1.selectAll('option').attr('selected', (desc, i) => i === descriptions.length-1 ? true : null ); // by default, select last column. set the others to null to remove the selected property
      updateTable = true; // attributes have changed
    }

    const attrSelect2 = d3.select(this.node).select('select.attr[name="attr2[]"]');
    if (attrSelect2.selectAll('option:checked').empty()) { // make a default selection
      attrSelect2.selectAll('option').attr('selected', true); // by default, select all
      updateTable = true; // attributes have changed
    }

    options.exit().remove();
    options.order();

    if (updateTable) {
      this.updateTable();
    }
  }

  public updateTable() {
    WorkerManager.terminateAll(); // Abort all calculations as their results are no longer needed
    this.removeOldVisuallization();

    const timestamp = new Date().getTime().toString();
    d3.select(this.node).attr('data-timestamp', timestamp);


    let colData =  d3.select(this.node).selectAll('select.attr[name="attr1[]"] option:checked').data();
    let rowData = d3.select(this.node).selectAll('select.attr[name="attr2[]"]  option:checked').data();
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

      // create a table body for every column
      const bodies = d3.select(that.node).select('table').selectAll('tbody').data(bodyData, (d) => d[0][0].label); // the data of each body is of type: Array<Array<IScoreCell>>
      bodies.enter().append('tbody'); //For each IColumnTableData, create a tbody

      // the data of each row is of type: Array<IScoreCell>
      const trs = bodies.selectAll('tr').data((d) => d, (d) => d[0].label); // had to specify the function to derive the data (d -> d)
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d);
      tds.enter().append('td');
      // Set colheads in thead
      colHeadsSpan.text((d) => d.label);
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
      // Exit
      colHeads.exit().remove(); // remove attribute columns
      colHeads.order();
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
      bodies.exit().remove();
      trs.order();
      bodies.order();
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
            data[rowIndex][0][colIndex+1] = {label: '&#x26AB', measure: null};
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
              rowPromises.push(measure.calc(data1, data2, null) //allData is not needed here, data1 and data2 contain all items of the attributes.
                .then((score) => {
                  data[rowIndex][0][colIndex+1] = this.toScoreCell(score, measure, setParameters);
                  if(rowIndexInCols >= 0 && colIndexInRows >= 0) {
                    data[colIndexInRows][0][rowIndexInCols+1] = this.toScoreCell(score, measure, setParameters);
                  }
                }).catch((err) => row[colIndex] = {label: 'err'})
              ); // if you 'await' here, the calculations are done sequentially, rather than parallel. so store the promises in an array
            }
          }
        }

        promises.concat(rowPromises);
        Promise.all(rowPromises).then(() => update(data));
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }

  prepareDataArray(colAttributes: IColumnDesc[], rowAttributes: IColumnDesc[]) {
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

    this.scope = SCOPE.SETS;
  }

  initContent() {
    this.node.insertAdjacentHTML('beforeend', rowCmpHtml);
    super.initContent();

    d3.select(this.node).selectAll('select').on('input', () => this.updateTable());
  }


  public update() {
    this.updateSelectors();
  }

  private updateSelectors(): any {
    const descriptions = this.getAttriubuteDescriptions();

    // Update Row Selectors
    // Rows are grouped by categories, so we filter the categorical attributes:
    const catDescriptions = descriptions.filter((desc) => (desc as ICategoricalColumnDesc).categories);
    // For each attribute, create a <optgroup>
    const rowSelectors = d3.select(this.node).selectAll('select.row');
    const optGroups = rowSelectors.selectAll('optgroup').data(catDescriptions, (desc) => desc.label);
    optGroups.enter().append('optgroup').attr('label', (desc) => desc.label);
    // For each category, create a <option> inside the optgroup
    const rowOptions = optGroups.selectAll('option').data((d: ICategoricalColumnDesc) => d.categories);
    rowOptions.enter().append('option').text((cat: ICategory) => cat.label);

    // Remove atribtues and categories that were removed and order the html elements
    rowOptions.exit().remove();
    rowOptions.order();
    optGroups.exit().remove();
    optGroups.order();

    // Update Attribute Selectors
    const attrSelector = d3.select(this.node).select('select.attr');
    const attrOptions = attrSelector.selectAll('option').data(descriptions, (desc) => desc.label); // duplicates are filtered automatically
    attrOptions.enter().append('option').text((desc) => desc.label);

    let updateTable = !attrOptions.exit().filter(':checked').empty(); //if checked attributes are removed, the table has to update

    if (attrSelector.selectAll('option:checked').empty()) { // make a default selection
      attrSelector.selectAll('option').attr('selected', (desc, i) => i === descriptions.length-1 ? true : null ); // by default, select last column. set the others to null to remove the selected property
      updateTable = true; // attributes have changed
    }
  }

  updateTable() {
    WorkerManager.terminateAll(); // Abort all calculations as their results are no longer needed
    // numerical and categorical data is ok
    const compareTo = [this.ranking.getSelectionDesc()];
    this.removeOldVisuallization();
    this.createTable([], compareTo);
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
      colHeadsCatSpan.style('background-color', (d) => d && d.color ? d.color : '#FFF');
      colHeadsCatSpan.style('color', (d) => d && d.color ? textColor4Background(d.color) : '#333');
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


export function textColor4Background(backgroundColor: string) {
  let color = '#333333';
  if ('transparent' !== backgroundColor && d3.hsl(backgroundColor).l < 0.5) { //transparent has lightness of zero
    color =  'white';
  }

  return color;
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
