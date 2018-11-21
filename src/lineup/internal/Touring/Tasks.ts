import {IColumnDesc, ICategory} from 'lineupjs';
import {MethodManager, IMeasureResult, ISimilarityMeasure, IMeasureVisualization, ISetParamets, Type, SCOPE} from 'touring';
import * as d3 from 'd3';
import {RankingAdapter} from './TouringPanel';
import {IServerColumn} from '../../../rest';


export const Tasks = new Array<ATouringTask>();
export function TaskDecorator() {
  return function (target: {new(): ATouringTask}) { // only instantiable subtypes of ATouringTask can be passed.
    Tasks.push(new target());
  };
}


export interface ITouringTask {
  id: string;
  label: string;
  
  scope: SCOPE; // Does the Task use attributes or subsets of them?
}

export abstract class ATouringTask implements ITouringTask{
  public id: string;
  public label: string;
  public node: HTMLElement;
  
  public scope: SCOPE;

  ranking: RankingAdapter;

  public init(ranking: RankingAdapter, node: HTMLElement) {
    this.ranking = ranking;
    this.node = d3.select(node).append('div').attr('class', `task ${this.id}`).node() as HTMLElement;
    this.initContent();
  }
  
  initContent() {
    //add legend for the p-values
    this.createLegend( d3.select(this.node));
    //add div for the detail (detail text and visualisation)
    d3.select(this.node).append('div').classed('details', true);
  }

  public abstract update(data: any[]) 
  // {
  //     const ps = d3.select(this.node).selectAll('p').data(data, (data) => data.column); //column property is key
  //     ps.enter().append('p').text((attr) => attr.label); //enter: add tasks to dropdown
  //     // update: nothing to do
  //     ps.exit().remove();   // exit: remove tasks no longer displayed
  //     ps.order();           // order domelements as in the array
  // }

  toScoreCell(score: IMeasureResult, measure :ISimilarityMeasure, setParameters: ISetParamets): IScoreCell {
    const color =  score2color(score.pValue);
    return {
      label: score.pValue.toFixed(2),
      background: color.background,
      foreground: color.foreground,
      score: score,
      measure: measure,
      setParameters: setParameters
    }
  }

      // creates legend for the p-value
      private createLegend(parentElement: d3.Selection<any>)
      {
        let divLegend = parentElement.append('div').classed('measure-legend',true);
        let svgLegendContainer = divLegend.append('svg')
                                  .attr('width','100%')
                                  .attr('height',70);
    
        let svgDefs = svgLegendContainer.append('defs').append('linearGradient')
                                                      .attr('id','gradLegend');    
        svgDefs.append('stop')
                .attr('offset','0%')
                .attr('stop-color','#A9A9A9'); 
        svgDefs.append('stop')
                .attr('offset','50%')
                .attr('stop-color','#FFFFFF'); 
        
        let xStart = 10;
        let yStart = 25;
        let barWidth = 150;
        let barHeight = 15;
        let barSpace = 10;
        let textHeight = 15;
    
        let svgLegendLabel = svgLegendContainer.append('g');
        let svgLabel = svgLegendLabel.append('text')
        .attr('x',5)
        .attr('y',15)
        .attr('text-anchor','start')
        .text('p-value:');
    
        
    
        let svgLegendGroup = svgLegendContainer.append('g');
        let svgRect1 = svgLegendGroup.append('rect')
                                    .attr('x',xStart)
                                    .attr('y',yStart)
                                    .attr('width',barWidth)
                                    .attr('height',barHeight)
                                    .style('fill','url(#gradLegend)')
                                    .style('stroke-width',1)
                                    .style('stroke','black');
        let svgText11 = svgLegendGroup.append('text')
        .attr('x',xStart)
        .attr('y',yStart+barHeight+textHeight)
        .attr('text-anchor','start')
        .text('0');
        let svgText12 = svgLegendGroup.append('text')
        .attr('x',xStart+barWidth/2)
        .attr('y',yStart+barHeight+textHeight)
        .attr('text-anchor','middle')
        .text('0.05');
        let svgText13 = svgLegendGroup.append('text')
        .attr('x',xStart+barWidth)
        .attr('y',yStart+barHeight+textHeight)
        .attr('text-anchor','end')
        .text('0.1');
        let svgRect2 = svgLegendGroup.append('rect')
                                    .attr('x',xStart+barWidth+barSpace)
                                    .attr('y',yStart)
                                    .attr('width',barWidth)
                                    .attr('height',barHeight)
                                    .style('fill','white')
                                    .style('stroke-width',1)
                                    .style('stroke','black');
    
        let svgText21 = svgLegendGroup.append('text')
        .attr('x',xStart+barWidth+barSpace)
        .attr('y',yStart+barHeight+textHeight)
        .attr('text-anchor','start')
        .text('0.1');
        let svgText22 = svgLegendGroup.append('text')
        .attr('x',xStart+barWidth+barSpace+barWidth)
        .attr('y',yStart+barHeight+textHeight)
        .attr('text-anchor','end')
        .text('1');
      }

  private generateVisualDetails (miniVisualisation: d3.Selection<any>, measure: ISimilarityMeasure, measureResult: IMeasureResult){
    
    let divDetailInfo = miniVisualisation.append('div')
                                    .classed('detailVis',true);
  
    // let detailTestType = divDetailInfo.append('div');
    divDetailInfo.append('div')
                  .classed('detailDiv',true)
                  .text('Test: ')
                  .append('span')
                  .text(measure.label);
  
    // let detailTestValue = divDetailInfo.append('div');
    let scoreValue = measureResult.scoreValue.toFixed(3);
    let pValue = measureResult.pValue.toFixed(3);
    divDetailInfo.append('div')
                .classed('detailDiv',true)
                .text('Test-Value/p-Value: ')
                .append('span')
                .text(`${scoreValue}/${pValue}`);  
  
    // let detailTestDescr = divDetailInfo.append('div');
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
      if(measure.visualization){
        const visualization: IMeasureVisualization = measure.visualization;
        if(cellData.setParameters)
        {
          visualization.generateVisualization(details,cellData.setParameters);
        }
        
      }  
    }
  }
}

@TaskDecorator()
export class ColumnComparison extends ATouringTask {

  constructor() {
    super();
    this.id = "attrCmp";
    this.label = "Pairwise compare columns";

    this.scope = SCOPE.ATTRIBUTES;
  }

  initContent() {
    const tablesEnter = d3.select(this.node)
      .append('div').attr('class', 'table-container')
      .append('table').attr('class', 'table table-condensed');
    tablesEnter.append('thead').append('tr').append('th');
    tablesEnter.append('tbody');

    super.initContent();
  }

  public update(data: any[]) {
    const colHeads = d3.select(this.node).select('thead tr').selectAll('th.head').data(data, (d) => d.column); // column is key
    colHeads.enter().append('th').attr('class', 'head');
    
    const that = this; // for the function below
    function updateTableBody(bodyData: Array<Array<any>>) {
      const trs = d3.select(that.node).select('tbody').selectAll('tr').data(bodyData, (d) => d[0].label);
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d); // remove 
      tds.enter().append('td');
      // Set colheads in thead 
      colHeads.text((d) => d.label);
      // set data in tbody
      tds.attr('colspan', (d) => d !== null ? d.colspan : 1);
      tds.attr('rowspan', (d) => d !== null ? d.rowspan : 1);
      tds.style("color", (d) => d !== null  ? d.foreground : '#333333');
      tds.style('background-color', (d) => d !== null ? d.background : '#FFFFFF');
      tds.attr('class', (d: any) => {
        // icon for the attribute type
        if(d && d.type && d.type === 'categorical'){
          return 'icon-category';
        }else if (d && d.type && d.type === 'number'){
          return 'icon-number';
        }
        return null;
      });
      tds.classed('action', (d) => (d !== null && d.score !== undefined));
      tds.html((d) => d === null ? '<i class="fa fa-circle-o-notch fa-spin"></i>' : d.label);
      tds.on('click', function() { that.onClick.bind(that)(this)})
      // Exit
      colHeads.exit().remove(); // remove attribute columns
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
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
  private async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][]) => void): Promise<Array<Array<any>>> {
    const data = new Array(attr2.length); // n2 arrays (rows) 
    for (let i of data.keys()) {
      data[i] = new Array(attr1.length + 1).fill(null) // containing n1+1 elements (header + n1 vlaues)
      data[i][0] = {label: `<b>${attr2[i].label}</b>`, type: attr2[i].type};
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      for (let [i, row] of data.entries()) {
        for (let j of row.keys()) {
          if (j > 0) {
            const measures = MethodManager.getMeasuresByType(Type.get(attr1[j - 1].type), Type.get(attr2[i].type), SCOPE.ATTRIBUTES); 
            if (measures.length > 0 && j <= i+1) { // start at 
              const measure = measures[0]// Always the first
              const data1 = this.ranking.getAttributeDataDisplayed((attr1[j - 1]as IServerColumn).column) //minus one because the first column is headers
              const data2 = this.ranking.getAttributeDataDisplayed((attr2[i] as IServerColumn).column);
              const setParameters = {
                setA: data1,
                setADesc: attr1[j - 1],
                setB: data2,
                setBDesc: attr2[i]
              };
              promises.push(measure.calc(data1, data2)
              .then((score) => {
                row[j] = this.toScoreCell(score,measure,setParameters);
                update(data);
              })
                .catch((err) => row[j] = {label: 'err'})
              ); // if you 'await' here, the calculations are done sequentially, rather than parallel. so store the promises in an array
            } else {
              row[j] = ''; // empty (not null, because null will display spinning wheel)
            }
          }
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }
}

// No decorator as i don't want it in the dropdown 
export abstract class RowComparison extends ATouringTask {

  constructor() {
    super();
    this.id = "itemCmp";
    this.label = "Pairwise compare rows";

    this.scope = SCOPE.SETS;
  }

  initContent() {
    //Table
    const tablesEnter = d3.select(this.node)
      .append('div').attr('class', 'table-container')
      .append('table').attr('class', 'table table-condensed');

    //Table Head
    const thead = tablesEnter.append('thead');
    const theadRow1 = thead.append('tr').attr('class', 'attr');
    theadRow1.append('th');
    theadRow1.append('th').text('Attribute');
    const theadRow2 = thead.append('tr').attr('class', 'cat');;
    theadRow2.append('th').text('Attribute');
    theadRow2.append('th').text('Category');

    //Table Body
    tablesEnter.append('tbody');

    super.initContent();
  }
}

@TaskDecorator()
export class SelectionStratificationComparison extends RowComparison{

  constructor() {
    super();
    this.id = "selStratCmp";
    this.label = "Compare selected rows with stratification groups"
  }

  update(data: any) {
    // numerical and categorical data is ok
    const compareTo = [this.ranking.getSelectionDesc()];
    this.createTable(data, compareTo);
  }

  createTable(catData: any[], compareTo: {categories: ICategory[]; label: string; type: string; column: string;}[]): any {
    const colHeadsAttr = d3.select(this.node).select('thead tr.attr').selectAll('th.head').data(compareTo, (attr) => `${attr.column}/${attr.categories.length}`); //include category length to update if a category is added/removed
    colHeadsAttr.enter().append('th')
      .attr('class', 'head')
      .attr('colspan', (attr) => attr.categories.length);
    const colHeadsCat = d3.select(this.node).select('thead tr.cat').selectAll('th.head').data([].concat(...compareTo.map((attr)  => attr.categories)), (cat) => cat.name); // cat.name != label
    colHeadsCat.enter().append('th')
      .attr('class', 'head');

    const that = this; // for the function below
    function updateTableBody(bodyData: Array<Array<IScoreCell>>) {
      const trs = d3.select(that.node).select('tbody').selectAll('tr').data(bodyData, (d) => d[0].key);
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d);
      tds.enter().append('td');
      // Set colheads in thead 
      colHeadsAttr.text((d) => d.label);
      colHeadsCat.text((d) => d.label);
      // set data in tbody
      tds.attr('colspan', (d) => d !== null ? d.colspan : 1);
      tds.attr('rowspan', (d) => d !== null ? d.rowspan : 1);
      tds.style("color", (d) => d !== null  ? d.foreground : '#333333');
      tds.style("background-color", (d) => d !== null ? d.background : '#FFFFFF');
      tds.attr('class', (d: any) => {
        // icon for the attribute type
        if(d && d.type && d.type === 'categorical'){

          return 'icon-category';
        }else if (d && d.type && d.type === 'number'){
          return 'icon-number';
        }
        return null;
      });
      tds.classed('action', (d) => (d !== null && d.score !== undefined));
      tds.html((d) => d === null ? '<i class="fa fa-circle-o-notch fa-spin"></i>' : d.label);
      tds.on('click', function() { that.onClick.bind(that)(this)})
      // Exit
      tds.exit().remove(); // remove cells of removed columns
      colHeadsAttr.exit().remove(); // remove attribute columns
      colHeadsCat.exit().remove(); // remove attribute columns
      trs.exit().remove(); // remove attribute rows
      colHeadsAttr.order();
      colHeadsCat.order();
      trs.order(); // Order the trs is important, if you have no items selected and then do select some, the select category would be at the bottom and the unselect category at the top of the table
    }
    
    this.getAttrTableBody(compareTo, catData, true, null).then(updateTableBody); // initialize
    this.getAttrTableBody(compareTo, catData, false, updateTableBody).then(updateTableBody); // set values
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][]) => void): Promise<Array<Array<IScoreCell>>> {
    const allCat1 = [].concat(...attr1.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const groupedData = this.ranking.getGroupedData();
    const data = new Array(attr2.length * groupedData.length); // each attribute has the same groups

    let i=0;
    for (const col of attr2) {
      for (const [j, grp] of groupedData.entries()) {
        data[i] = new Array(allCat1.length + (j === 0 ? 2 : 1)).fill(null)
        data[i][j === 0 ? 1 : 0] = { // through rowspan, this becomes the first array item 
          label: grp.label,
          background: grp.color
        }
        if (j === 0) {
          data[i][0] = {
            label: col.label,
            rowspan: groupedData.length,
            type: col.type
          };
        }
        data[i][0].key = col.label+'-'+grp.name;
        i++;
      }
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];

      let i=0;
      for (const col of attr2) {
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
            if (selectIndices.length > 0 && index === selectIndices[0]) {
              selectIndices.shift(); // Remove first element as we have reached it
              dataSelected.push(item[colId])
            } else {
              dataUnselected.push(item[colId]);
            }
          }


          for (const [j, grpData] of groupedData.entries()) {
            const grpData4Col = grpData.rows.map((row) => row[(col as IServerColumn).column]);

            let rowIndex = i; // by declaring it in this block, it is scoped and we don't need a closure to have the right value in the promise
            // Score with selected:
            let firstScoreIndex = j === 0 ? 2 : 1; //rows with attribute label have a 2 items, others just 1 item before the first score
            if(allCat1.indexOf('Selected') >= 0) { // ensure that there is a column
              let selScoreIndex = firstScoreIndex + allCat1.indexOf('Selected');
              const setParameters = {
                setA: dataSelected,
                setADesc: attr1[0],
                setACategory: 'Selected',
                setB: grpData4Col,
                setBDesc: col,
                setBCategory: groupedData[j]
              };
              promises.push(measure.calc(dataSelected, grpData4Col)
                    .then((score) => {
                      data[rowIndex][selScoreIndex] = this.toScoreCell(score,measure,setParameters);
                      update(data);
                    })
                    .catch((err) => data[rowIndex][selScoreIndex] = {label: 'err'} ));
            }

            if(allCat1.indexOf('Unselected') >= 0) {  // ensure that there is a column
              let unselScoreIndex = firstScoreIndex + allCat1.indexOf('Unselected');
              const setParameters = {
                setA: dataUnselected,
                setADesc: attr1[0],
                setACategory: 'Unselected',
                setB: grpData4Col,
                setBDesc: col,
                setBCategory: groupedData[j]
              };
              // Score with unselected:
              promises.push(measure.calc(dataUnselected, grpData4Col)
                    .then((score) => {
                      data[rowIndex][unselScoreIndex] = this.toScoreCell(score,measure,setParameters);
                      update(data);
                    })
                    .catch((err) => data[rowIndex][unselScoreIndex] = {label: 'err'}));
            }
            i++;
          }
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }
}


@TaskDecorator()
export class SelectionCategoryComparison extends SelectionStratificationComparison{

  constructor() {
    super();
    this.id = "selCatCmp";
    this.label = "Compare selected rows with column categories"
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
  async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][]) => void): Promise<Array<Array<IScoreCell>>> {
    const allCat1 = [].concat(...attr1.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const allCat2 = [].concat(...attr2.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const data = new Array(allCat2.length); // one row per category
    let i=0;
    for (const col of attr2) {
      for (const [j, cat] of (col as any).categories.entries()) {
        data[i] = new Array(allCat1.length + (j === 0 ? 2 : 1)).fill(null)
        data[i][j === 0 ? 1 : 0] = { // through rowspan, this becomes the first array item 
          label: cat.label,
          background: cat.color
        } 
        if (j === 0) {
          data[i][0] = {
            label: col.label,
            rowspan: (col as any).categories.length,
            type: col.type
          };
        }
        data[i][0].key = col.label+'-'+cat.label;
        i++;
      }
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      const measure = MethodManager.getMeasuresByType(Type.CATEGORICAL, Type.CATEGORICAL, SCOPE.SETS)[0]; // fixed for this task: we compare categories to groups of items of the same column --> always categorical
      
      let i=0;
      for (const col of attr2) {
        for (const [j, cat] of (col as any).categories.entries()) {
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

            if (selectIndices.length > 0 && index === selectIndices[0]) {
              selectIndices.shift(); // Remove first element as we have reached it
              dataSelected.push(item[colId])
            } else {
              dataUnselected.push(item[colId]);
            }
          }
          
          let rowIndex = i; // by declaring it in this block, it is scoped and we don't need a closure to have the right value in the promise
          // Score with selected:
          let firstScoreIndex = j === 0 ? 2 : 1; //rows with attribute label have a 2 items, others just 1 item before the first score
          if(allCat1.indexOf('Selected') >= 0) { // ensure that there is a column
            let selScoreIndex = firstScoreIndex + allCat1.indexOf('Selected');
            const setParameters = {
              setA: dataSelected,
              setADesc: attr1[0],
              setACategory: 'Selected',
              setB: dataCategory,
              setBDesc: col,
              setBCategory: cat.name 
            };
            promises.push(measure.calc(dataSelected, dataCategory)
                  .then((score) => {
                    data[rowIndex][selScoreIndex] = this.toScoreCell(score,measure,setParameters);
                    update(data);
                  })
                  .catch((err) => data[rowIndex][selScoreIndex] = {label: 'err'}));
          }

          if(allCat1.indexOf('Unselected') >= 0) {  // ensure that there is a column
            let unselScoreIndex = firstScoreIndex + allCat1.indexOf('Unselected');
            const setParameters = {
              setA: dataUnselected,
              setADesc: attr1[0],
              setACategory: 'Unselected',
              setB: dataCategory,
              setBDesc: col,
              setBCategory: cat.name 
            };
            // Score with unselected:
            promises.push(measure.calc(dataUnselected, dataCategory)
                    .then((score) => {
                      data[rowIndex][unselScoreIndex] = this.toScoreCell(score,measure,setParameters);
                      update(data);
                    })
                  .catch((err) => data[rowIndex][unselScoreIndex] = {label: 'err'}));
          }
          i++;
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }
}

@TaskDecorator()
export class PairwiseStratificationComparison extends SelectionStratificationComparison{

  constructor() {
    super();
    this.id = "pairStratCmp";
    this.label = "Pairwise compare stratification groups"
  }

  update(data: any) {
    // numerical and categorical data is ok
    const compareTo = [this.ranking.getStratificationDesc()];
    this.createTable(data, compareTo);
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], scaffold: boolean, update: (bodyData: IScoreCell[][]) => void): Promise<Array<Array<IScoreCell>>> {
    const allCat1 = [].concat(...attr1.map((attr: any)  => attr.categories.map((catObj) => catObj.label)));
    const groupedData = this.ranking.getGroupedData();
    const data = new Array(attr2.length * groupedData.length); // each attribute has the same groups

    let i=0;
    for (const col of attr2) {
      for (const [j, grp] of groupedData.entries()) {
        data[i] = new Array(allCat1.length + (j === 0 ? 2 : 1)).fill(null)
        data[i][j === 0 ? 1 : 0] = { // through rowspan, this becomes the first array item 
          label: grp.label,
          background: grp.color
        }
        if (j === 0) {
          data[i][0] = {
            label: col.label,
            rowspan: groupedData.length,
            type: col.type
          };
        }
        data[i][0].key = col.label+'-'+grp.name;
        i++;
      }
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      let i=0;
      
      for (const col of attr2) {
        const measures = MethodManager.getMeasuresByType(Type.get(col.type), Type.get(col.type), SCOPE.SETS); // Always compare selected elements with a group of elements of the same column
        if (measures.length > 0) { 
          const measure = measures[0];
          for (const [j, grpData] of groupedData.entries()) {
            const grpData4ColRow = grpData.rows.map((row) => row[(col as IServerColumn).column]); //data for the current row
            const rowIndex = i; // by declaring it in this block, it is scoped and we don't need a closure to have the right value in the promise
            const firstScoreIndex = j === 0 ? 2 : 1; //rows with attribute label have a 2 items, others just 1 item before the first score
            
            for (const [k, grpData] of groupedData.entries()) {
              const colIndex = firstScoreIndex + k;
              if(k <= j) { // only diagonal
                const grpData4ColCol = grpData.rows.map((row) => row[(col as IServerColumn).column]); //data for the current column
                const setParameters = {
                  setA: grpData4ColCol,
                  setADesc: col,
                  setACategory: groupedData[k],
                  setB: grpData4ColRow,
                  setBDesc: col,
                  setBCategory: groupedData[j],
                };
                promises.push(measure.calc(grpData4ColRow, grpData4ColCol)
                  .then((score) => {
                    data[rowIndex][colIndex] = this.toScoreCell(score,measure,setParameters);
                    update(data);
                  })
                  .catch((err) => data[rowIndex][colIndex] = {label: 'err'}));
              } else {
                data[rowIndex][colIndex] = {label: ''}
              }
            }
            i++;
          }
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }
}

interface IScoreCell {
  key?: string,
  label: string,
  background?: string,
  foreground?: string,
  rowspan?: number,
  colspan?: number,
  score?: IMeasureResult,
  measure?: ISimilarityMeasure,
  setParameters?: ISetParamets
}



export function score2color(score:number) : {background: string, foreground: string} {
  let background ='#ffffff' //white
  let foreground = '#333333' //kinda black


  if(score <= 0.05) {
    // console.log('bg color cahnge')
    let calcColor = d3.scale.linear().domain([0.05, 1]).range(<any[]>['#A9A9A9', '#FFFFFF']);
                                      
    background = calcColor(score).toString();
    foreground = d3.hsl(background).l > 0.5 ? '#333333' : 'white'
  }

  return {
    background: background,
    foreground: foreground
  };
}
