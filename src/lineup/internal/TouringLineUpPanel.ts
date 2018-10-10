import {ICategoricalColumnDesc, ICategoricalColumn, LocalDataProvider, IColumnDesc, ICategory, CategoricalColumn, createImpositionBoxPlotDesc, Column, Ranking, IDataRow} from 'lineupjs';
import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, ISImilarityMeasure, MeasureMap} from 'touring';
import * as d3 from 'd3';
import 'd3.parsets';
import 'd3-grubert-boxplot';
import {isProxyAccessor} from './utils';

export default class TouringLineUpPanel extends LineUpPanelActions {

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

    this.itemTab = d3.select(this.node).select('#itemTouring').node();
    this.attributeTab = d3.select(this.node).select('#attributeTouring').node();

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
    // HTML ELEMENT LISTENERS
    // -----------------------------------------------
    // changes of radio button selection
    //    cause changes in the second dropdown (of)
    //    and changes in the displayed table / scores
    d3.select(this.node).selectAll('input[name="compareGroup"]').on('change', () => {
      // using fat arrow: global scope replaces new object's scope and 'this' can be used to call class functions
      const radio = d3.select(this.node).select('input[name="compareGroup"]:checked')
      console.log('radio button value: ', radio.property('value'), ' | object: ', radio);
      this.updateItemTab()
    });

    // changes made in dropdowns
    //    cause changes the displayed table / scores 
    d3.select(this.node).selectAll('select').on('input', () => this.updateTouringPanel());


    const self = this;
    // tab changed
    d3.select(this.node).selectAll('ul.nav a').on('click', function() {
      if (this.href.indexOf('item') >= 0) {
        self.updateItemTab();
      } else if (this.href.indexOf('attr') >= 0) {
        self.updateAttributeTab();
      }
    });

    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores 
    //  if no items are selected, the table should be displayed by a message
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringPanel()); //fat arrow to preserve scope in called function (this)

    // column of a table was added
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringPanel());

    // column of a table was removed
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringPanel());

    // for filter changes and stratification changes
    //  After the number of items has changed, the score change aswell
    // If the stratification changes, the "Stratification" attribute and possibly the table has to be changed
    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringPanel());
  }

  private updateTouringPanel() {
    // NOTE: after clicking on a tab, the class is not immidiatly correct/updated.
    if (d3.select(this.itemTab).classed('active')) {
      console.log('item tab is active, update content...');
      this.updateItemTab();
    } else if (d3.select(this.attributeTab).classed('active')) {
      console.log('attribtue tab is active, update content...');
      this.updateAttributeTab();
    }
  }

  private updateItemTab() {
    this.updateItemControls();
    //changing the radio button or the removing columns could create a different selection in the dropdowns
    //therefore the touring data will be updated
    this.updateItemScores();
  }

  private updateItemScores() {
    const currentData = this.ranking.getItemsDisplayed();
    // console.log('current data: ', currentData);
    const inputA = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum());
    const inputB = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareB').select('option:checked').datum());

    // console.log('Inputs to get set measures:');
    // console.log('A: ', inputA);
    // console.log('B: ', inputB);
    const setMeasures: MeasureMap = MethodManager.getSetMethods(inputA, inputB);
    // console.log('set measures for current data: ', setMeasures);

    // div element in html where the score and detail view should be added
    let measuresDivElement = d3.select(this.itemTab).select('div[class="measures"]');
    measuresDivElement.selectAll("*").remove(); //deletes all generated content im 'measuresDivElement'

    let defaultExpanded = true; //defines if the first accordion item should be expanded at the beginning

    if (setMeasures && setMeasures.size > 0) {
      //group panel (accordion) for all acordion items
      let accordionId = this.getIdWithTimestamp('accordion');
      let panelGroup = measuresDivElement.append('div')
        .attr('class', 'panel-group')
        .attr('id', accordionId);

      setMeasures.forEach((typeMeasures, type) => {
        typeMeasures.forEach((measure) => {
          let collapseId = this.getIdWithTimestamp(measure.id);
          //console.log('accordion item/collapse id: ',collapseId);

          let collapseDetails = {
            groupId: accordionId,
            id: collapseId,
            label: measure.label,
            default: defaultExpanded
          };

          //after the first accordion was created -> the following ones should be collapsed
          if (defaultExpanded) {
            defaultExpanded = !defaultExpanded;
          }

          //create accordion item and add it to the panel group
          //FIXME: make spaces before accordion and at the top of each collapsable smaller 
          this.createAccordionItem(panelGroup, collapseDetails);

          //insert the calculated score (jaccard: table) into the before created accordion item
          this.insertMeasure(measure, collapseId, currentData)
        })
      });
    } else {
      measuresDivElement.append('p').text('Sorry, there are no appropriate measures for the selected inputs.');
    }
  }


  private updateAttributeTab() {
    console.log('Updating attribute tab.');
    this.updateAttributeControls();
    // TODO
    // changing the radio button or the removing columns could create a different selection in the dropdowns
    // therefore the touring data will be updated
    // this.updateAttributeScores();
  }

  private updateAttributeControls() {
    const dropdownA = d3.select(this.attributeTab).select('select.compareA');
    const dropdownB = d3.select(this.attributeTab).select('select.compareB');
    
    
    // TODO remove categories which are not displayed
    let descriptions: IColumnDesc[] = deepCopy(this.ranking.getDisplayedAttributes().map((col) => col.desc));
    // we generate an entry for every attribute (categorical, numerical, string, and maybe more(?))
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
    // TODO Add Rank
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

    //bin data, label is key
    const optionsA = dropdownA.selectAll('option').data(descriptions, (desc) => desc.label); 
    const optionsB = dropdownB.selectAll('option').data(descriptions, (desc) => desc.label);
    //enter: add columns to dropdown, that were added by the user
    optionsA.enter().append('option').text((desc) => desc.label);
    optionsB.enter().append('option').text((desc) => desc.label);
    
    // update: nothing to do

    // exit: remove columns no longer displayed
    optionsA.exit().remove(); 
    optionsB.exit().remove(); 
    // order domelements as in the array
    optionsA.order(); 
    optionsB.order(); 
  }


  //creates the accordion item (collapse) for one score
  private createAccordionItem(panelGroup: any, collapseDetails: any) {
    if (collapseDetails && collapseDetails instanceof Object &&
      collapseDetails.groupId && typeof collapseDetails.groupId === 'string' &&
      collapseDetails.id && typeof collapseDetails.id === 'string' &&
      collapseDetails.label && typeof collapseDetails.label === 'string') {
      let panel = panelGroup.append('div')
        .attr('class', 'panel');


      let panelHeading = panel.append('div')
        .attr('class', 'panel-heading')
        .attr('role', 'tab');


      let panelTitle = panelHeading.append('h4')
        .attr('class', 'panel-title'); //multiple expanded accordions
        // .html(`<a data-toggle="collapse" href="#${collapseDetails.id}">${collapseDetails.label}</a>`) //single expanded accordion
        
      
      let aCollapse = panelTitle.append('a')
          .attr('data-toggle','collapse')
          .attr('href','#'+collapseDetails.id)
          .attr('aria-expanded',collapseDetails.default.toString())
          .text(collapseDetails.label)


      let panelCollapse = panel.append('div')
        .attr('class', 'panel-collapse collapse')
        .attr('id', collapseDetails.id);

      if (collapseDetails.default) {
        panelCollapse.classed('in', true); //accordion item is expanded
      }

    }
  }

  private insertMeasure(measure: ISImilarityMeasure, collapseId: string, currentData: Array<any>) {

    this.generateMeasureTable(collapseId, measure.id , currentData);

  }

  // --------- DATA TABLE LAYOUT ---
  //generates a object, which contains the table head and table body
  private generateTableLayout(data: Array<any>, scoreType: string)
  {
    let generatedTable = {
      tableHead: [],
      tableBody: []
    };
    
    // TABLE HEADER
    generatedTable.tableHead = this.getTableHeader();

    // TABLE BODY 
    generatedTable.tableBody  = this.getTableBody(generatedTable.tableHead, data, scoreType);

    
    // console.log('generateTableLayout: ',generatedTable);
    return generatedTable;
  }

  //generate table header depending on the dropdown A option
  private getTableHeader()
  {
    let tableHeaders = [];
    let optionDDA = d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum().label;
    // console.log('DDA',optionDDA);

    if(optionDDA === 'Selection'){

      tableHeaders = [
        { columnName: 'col1', label: '', colour: '#ffffff'},
        { columnName: 'col2', label: '', colour: '#ffffff'},
        { columnName: 'col3', label: 'Selected', colour: '#ffffff'},
        { columnName: 'col4', label: 'Unselected', colour: '#ffffff'},
      ];

    }else if (optionDDA === 'Stratification Groups')
    {
      
      let allStratificationGroups = this.ranking.getStratificationDesc();
      let groups = allStratificationGroups.categories;
      // console.log('allStratificationGroups',allStratificationGroups);  

      tableHeaders = [
        { columnName: 'col1', label: '', colour: '#ffffff'},
        { columnName: 'col2', label: '', colour: '#ffffff'}
      ];
      let colOffset = 3;

      for(let i=0; i<groups.length; i++){

        // let oldLabel = groups[i].label;
        // let newLabel = oldLabel.replace('∩ ','∩\n');

        let tableHead = {
          columnName: 'col'+(i+colOffset),
          label: groups[i].label,
          color: '#ffffff'
        };
        tableHeaders.push(tableHead);
      }
    }

    return tableHeaders;
  }

  //generate table body depending on table head and radio button option
  private getTableBody(tableHeader: Array<any>, data: Array<any>, scoreType: string)
  {
    let tableBody = [];

    const chosenColumns = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareB').select('option:checked').datum());
    //console.log('generateTableLayout - chosenColumns: ', chosenColumns);
      

    let showCategoriesAfterFilter = this.getCategoriesAfterFiltering();
    //console.log('generateTableLayout - remaining labels: ',showCategoriesAfterFilter);


    // if(this.getRadioButtonValue() === 'category'){

      for(let i=0; i<chosenColumns.length; i++)
      {
        let currCol = chosenColumns[i];
        let currCatAfterFilter = currCol.categories.filter((item) => {return (showCategoriesAfterFilter.indexOf(item.label) !== -1);});
        
        for(let cnt=0; cnt < currCatAfterFilter.length; cnt++)
        {  
          let currCategory = currCatAfterFilter[cnt];
          let tableRow = {};
          let currRowPartitioning = this.getColumnPartioningParallelSets(data, tableHeader, currCol);
          
          for(let col=0; col < tableHeader.length; col++)
          {
            let colName = ((tableHeader[col] as any).columnName as string);
            
            if(col === 0) //first column (categorical column)
            {
              tableRow[colName] = {
                label: currCol.label,
                rowspan: (cnt === 0) ? currCatAfterFilter.length : 0              
              };

            }
            else if(col === 1)  //second column (categoroies of categircal column)
            {
              tableRow[colName] = {
                label: currCategory.label,
                color: currCategory.color
              };

            }else //all the other columns
            {
              let score = this.calcScore(data,scoreType ,(tableHeader[col] as any).label, currCol.column, currCategory.label);
              
              tableRow[colName] = {
                label: score, 
                column: currCol.column,
                column_label: currCol.label,
                category: currCategory.label,
                color: this.score2color(score),
                action: true,
                tableColumn: (tableHeader[col] as any).label,
                partitioning: currRowPartitioning
              };
            }
          }

          tableBody.push(tableRow);
          tableRow = {};

        }
      }
    // }else{
    //   //TODO generate table for stratificaiton option of radio button
    // }


    return tableBody;
  }

  // --------- TABLE GENERATION D3 ---
  // create table in container and depending on dataTable with D3
  private generateMeasureTable(containerId: string, scoreType: string, currentData: Array<any>)
  {
    const dataTable = this.generateTableLayout(currentData, scoreType);
    const that = this;

    // create a <div> as table container with D3
    let tableContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','table-container');

    // table                                        
    let table = tableContainer.append('table')
                            .attr('class','table table-condensed');
    
    // table header
    let tableHeader = table.append('thead');
    tableHeader.append('tr')
              .selectAll('th')
              .data(dataTable.tableHead as Array<any>)
              .enter()
              .append('th')
              .attr('class','text-center')
              .text(function(d) { return (d as any).label; });

    // table body
    let tableBody = table.append('tbody');

    // table rows -> create a row for each object in the data
    let rows = tableBody.selectAll('tr')
                      .data(dataTable.tableBody)
                      .enter()
                      .append('tr');


    // table cells
    if(scoreType === 'jaccard'){
      this.generateMeasureTableCellJaccard(containerId, rows,dataTable, this.generateVisualRepParallelSets);
    }else if(scoreType === 'overlap'){
      this.generateMeasureTableCellOverlap(containerId, rows,dataTable);
    }else if(scoreType === 'student_test'){
      this.generateMeasureTableCellTTest(containerId, rows,dataTable);
    }else if(scoreType === 'mwu_test'){
      this.generateMeasureTableCellMWUTest(containerId, rows,dataTable);
    }
                 
    
  }

  // creates table cell for jaccard score with all its formating and functionality
  private generateMeasureTableCellJaccard(containerId: string, rows: d3.Selection<any>, dataTable: any, actionFunciton: Function)
  {
    const that = this;

    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    let cells = rows.selectAll('td')
                    .data(function(row) {
                      //get all properties defined in dataTable.tableHead as an array with the data from the rows
                      let returnValues = dataTable.tableHead.map(function(column) {

                        // return an object for the column of the data row
                        return row[column.columnName];
                      });
                      // console.log('returnValues: ',returnValues);

                      //push all desired column objects into this array
                      let allDesiredReturnValues = returnValues.filter(function(cell) {
                          // return true if rowspan is not defiend OR rowspan exist and is bigger than 0
                          return  (cell.rowspan === undefined) || (cell.rowspan && cell.rowspan >0);
                        });

                      // console.log('allDesiredReturnValues: ',allDesiredReturnValues);
                      return allDesiredReturnValues;
                    })
                    .enter()
                    .append('td')
                    .attr('class','text-center align-middle')
                    .attr("rowspan", function(d:any){
                      if(d.rowspan){
                        return d.rowspan;
                      }
                      return 1;
                     })
                    .text(function(d:any) { 
                      if(d.label && Number(d.label.toString())) {
                        return Number(d.label.toString()).toFixed(2);  
                      }

                      return d.label; 
                    })
                    .style("background-color", function(d:any){
                      return d.color || '#ffffff';
                     })
                    .on("mouseover", function(d:any) {
                      if(d.action) {
                        //d3.select(this).classed('bg-primary',true);
                        d3.select(this).style("background-color", function(d){
                                                                    return '#fba74d';
                                                                  })
                                      .style("font-weight", 'bolder');                                      
                      }
                    })					
                    // FIXME: change colour of text depending on background (balck on black -> bad)
                    .on("mouseout", function(d:any) {
                      if(d.action) {
                        //d3.select(this).classed('bg-primary',false);
                        d3.select(this).style("background-color", function(d){
                                                                    return d.color || '#ffffff';
                                                                  })
                                      .style("font-weight", 'normal'); 
                      }
                    })
                    .on('click', function(d:any) {
                      if(d.action) {
                        actionFunciton.bind(that)(containerId,d);
                      }
                    }); 
  }

  // creates table cell for overlap score with all its formating and functionality
  private generateMeasureTableCellOverlap(containerId: string, rows: d3.Selection<any>, dataTable: any)
  {
    this.generateMeasureTableCellJaccard(containerId, rows, dataTable, this.generateVisualRepParallelSets);
  }

  // creates table cell for t-test score with all its formating and functionality
  private generateMeasureTableCellTTest(containerId: string, rows: d3.Selection<any>, dataTable: any)
  {
    this.generateMeasureTableCellJaccard(containerId, rows, dataTable, this.generateVisulRepBoxPlot);
  }

   // creates table cell for t-test score with all its formating and functionality
   private generateMeasureTableCellMWUTest(containerId: string, rows: d3.Selection<any>, dataTable: any)
   {
     this.generateMeasureTableCellJaccard(containerId, rows, dataTable, this.generateVisulRepBoxPlot);
   }
 

  // --------- VISUAL REPRESENTATION ---
  // creates visual representation as a parallel set (for jaccard)
  private generateVisualRepParallelSets(containerId: string, cell: any)
  {
    console.log('Cell clicken (ParSets): ',cell);
    console.log('Cell clicken (ParSets) - containerId: ',containerId);
    let optionDDA = d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum().label;
    
    let oldSvgContainer = d3.select(this.itemTab).select('div[class="svg-container '+containerId+'"]');
    oldSvgContainer.remove(); //deletes all generated content im 'measuresDivElement'

    let svgContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','svg-container '+containerId);
  
    let width = Number(svgContainer.style('width').slice(0,-2));

    //dimensions for the parallel sets
    //added prefix of dimension, otherwise the parallel sets can't be drawn with the same dimension twice
    let dimension1 = '1.Dim: '+cell.column_label;
    let dimension2 = (optionDDA === 'Selection') ? '2.Dim: Selection' : '2. Dim: Stratification Groups';
    
    let colPart = cell.partitioning;
    let parSetData = [];

    for(let i=0; i<colPart.length; i++)
    {
      let headerPart = colPart[i].parts;
      let categoryLabel = colPart[i].categoryLabel;

      for(let p=0; p<headerPart.length; p++)
      {
        let newData = {};
        newData[dimension1] = categoryLabel;
        newData[dimension2] = headerPart[p].label;
        newData['value'] = headerPart[p].amount;
        parSetData.push(newData);
      }
       
    }
    console.log('Cell clicken (ParSets) - data: ',parSetData);


    const that = this;

    // console.log('SVG Conatiner - width: ',width);
    let chart = (<any>d3).parsets()
                        .tension(0.5) //[0 .. 1] -> 1 = straight line 
                        .dimensions([dimension1, dimension2])
                        .value( function (d) { return d.value; })
                        .width(width)
                        .height(175); //175

    let svgCanvas = svgContainer.append('svg')
                                .attr('width',chart.width())
                                .attr('height',chart.height());
                                // .attr('height',chart.height());
                                // .attr('width','100%')
                                // .attr('height','100%');

    let svgFigureGroup = svgCanvas.append('g').attr('class','parSets');

    // draw parallel sets
    svgFigureGroup.datum(parSetData).call(chart);
    
    //rotation um 90 von den SVG parallel sets
    //svgFigureGroup.attr('transform','rotate(-90) translate(-'+width+',0)');

    let svgRibbon = svgFigureGroup.selectAll('g[class=ribbon]');
    // console.log('svgRibon: ',svgRibbon);

    //highlight current path
    //FIXME: the colour of the categories is always the same order blue,orage,green,... 
    //       -> if 2nd category is filterd out the next category should have the colour of the next displayed one
    let svgPaths = svgRibbon.selectAll('path')
                            .each(function(d) {
                              d3.select(this).classed('selected',false);

                              if(d.parent.name === cell.category && d.name === cell.tableColumn){
                                d3.select(this).classed('selected',true);
                              }
                              
                              let color = that.getColorOfCategory(d.parent.dimension.substring(7),d.parent.name);
                              if(color !== null)
                              {
                                d3.select(this).style('fill',color);
                              }
                              // console.log('path.this: ', d3.select(this));
                              // console.log('path.d: ',d);
                            });
    // console.log('svgPaths: ',svgPaths);

    let svgDimensions = svgFigureGroup.selectAll('g[class=dimension]');
    // console.log('svgDimensions',svgDimensions);
   
    //highlight label of current path
    svgDimensions.selectAll('g')
                 .each(function(d) {
                  d3.select(this).select('rect').classed('selected',false);
                  // console.log('dim.d: ',d);
                  // console.log('dim.this: ',d3.select(this));

                  if(d.name === cell.category){
                    d3.select(this).select('rect').classed('selected',true);
                  }

                  let color = that.getColorOfCategory(d.dimension.name.substring(7),d.name);
                  if(color !== null)
                  {
                    d3.select(this).select('rect').style('fill',color);
                  }
      
                });

  }
 
  private generateVisulRepBoxPlot(containerId: string, cell: any) 
  {
    console.log('Cell clicken (BoxPlot): ',cell);
    console.log('Cell clicken (BoxPlot) - containerId: ',containerId);
    let optionDDA = d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum().label;
    
    let oldSvgContainer = d3.select(this.itemTab).select('div[class="svg-container '+containerId+'"]');
    oldSvgContainer.remove(); //deletes all generated content im 'measuresDivElement'

    let svgContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','svg-container '+containerId);
  
    let containerWidth = Number(svgContainer.style('width').slice(0,-2));


    let margin = {top: 30, right: 50, bottom: 70, left: 50};
    let  width = 800 - margin.left - margin.right;
    let height = 400 - margin.top - margin.bottom;

    let data = [];
    data[0] = [];
    data[1] = [];
    data[2] = [];
    data[3] = [];
    data[0][0] = "Q1";
    data[1][0] = "Q2";
    data[2][0] = "Q3";
    data[3][0] = "Q4";
    data[0][1] = [20000,9879,5070,7343,91,36,7943,10546,9385,8669];
    data[1][1] = [15000,9323,9395,8675,5354,6725,10899,9365,8238,7446];
    data[2][1] = [8000,3294,17633,12121,4319,18712,17270,13676,16754];
    data[3][1] = [2000,5629,5752,7557,5125,5116,5828,6014,5996,8905];



    let chart = (d3 as any).box()
          .whiskers(function(d) {
                let q1 = d.quartiles[0],
                    q3 = d.quartiles[2],
                    iqr = (q3 - q1) * 1.5,
                    i = -1,
                    j = d.length;
                while (d[++i] < q1 - iqr);
                while (d[--j] > q3 + iqr);
                return [i, j];    
          })
          .height(175)	
          .domain([4000, 20000])
          .showLabels(true);


    let svgCanvas = svgContainer.append('svg')
          .attr('width',width + margin.left + margin.right)
          .attr('height',height + margin.top + margin.bottom);      

    let svgFigureGroup = svgCanvas.append('g')
                                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                  .attr('class','box');

    	// the x-axis
    let x = d3.scale.ordinal()	   
    .domain( data.map(function(d) { console.log(d); return d[0] } ) )	    
    .rangeRoundBands([0 , width], 0.7, 0.3); 		

    let xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    // the y-axis
    let y = d3.scale.linear()
      .domain([4000, 20000])
      .range([height + margin.top, 0 + margin.top]);

    let yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    // draw the boxplots	
    svgFigureGroup.data(data)
      .enter().append("g")
      .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
      .call(chart.width(x.rangeBand())); 
     
    // add a title
    svgFigureGroup.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 + (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "18px") 
        //.style("text-decoration", "underline")  
        .text("Revenue 2012");

    // draw y axis
    svgFigureGroup.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text") // and text1
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .style("font-size", "16px") 
      .text("Revenue in €");		

    // draw x axis	
    svgFigureGroup.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
      .call(xAxis)
      .append("text")             // text label for the x axis
        .attr("x", (width / 2) )
        .attr("y",  10 )
      .attr("dy", ".71em")
        .style("text-anchor", "middle")
      .style("font-size", "16px") 
        .text("Quarter"); 

  }

  private getColorOfCategory(column: string, category: string){
    // console.log('path.column: ',column);
    // console.log('path.category: ',category);
    let currColumn = this.provider.getRankings()[0].children.filter((item) => {return item.desc.label === column;});
    let color = null;
    if(currColumn[0] && (currColumn[0] as ICategoricalColumn).categories)
    {
      let currCategories = (currColumn[0] as ICategoricalColumn).categories;
      for(let i=0; i<currCategories.length; i++){
        if(currCategories[i].label === category){
          color = currCategories[i].color;
        }
      }
    }
    
    // console.log('path.color: ',color);
    return color;
  }

  // --------- SCORES ---
  // different kinds of score calculations
  private calcScore (data, scoreType: string ,headerCategory: string, columnB: string, categoryB: string): number {
    if(scoreType === 'jaccard')
    {
      return this.calcJaccardCoefficient(data, headerCategory, columnB, categoryB);
    } else if (scoreType === 'overlap'){

      return this.calcOverlapCoeffieient(data, headerCategory, columnB, categoryB);
    } else if (scoreType === 'student_test'){

      return this.calcStudentTest(data, headerCategory, columnB, categoryB);
    }else if (scoreType === 'mwu_test'){
      
      return this.calcMannWhitneyUTest(data, headerCategory, columnB, categoryB);
    }
  }

  // calculates the jaccard score
  private calcJaccardCoefficient(data, headerCategory: string, columnB: string, categoryB: string): number {
    const dataSets = this.getSelectionAndCategorySets(data, headerCategory, columnB, categoryB);
    const selectionSet = dataSets.selectionSet.map((item) => item[columnB]); //compare currently used attribute
    const categorySet = dataSets.categorySet.map((item) => item[columnB]);

    let intersection = [];
    const filteredSelectionSet = selectionSet.filter((selItem) => {
      const indexB = categorySet.findIndex((catItem) => catItem === selItem); // check if there is a corresponding entry in the second set
      if (indexB >= 0) {
        intersection.push(selItem);
        categorySet.splice(indexB, 1);
        return false; // selItem will drop out of selectionSet
      }
      return true;
    });

    // const intersection = selectionSet.filter(item => categorySet.indexOf(item) >= 0); // filter elements not in the second array
    // const union = selectionSet.concat(categorySet).sort().filter((item, i, arr) => !i || item != arr[i-1]) // !i => if first elemnt, or if unqueal to previous item (item != arr[i-1]) include in arr

    const score = intersection.length / (intersection.length + filteredSelectionSet.length + categorySet.length);

    return score || 0;
  }

  // calculates the overlap coefficient
  private calcOverlapCoeffieient(data, headerCategory: string, columnB: string, categoryB: string): number {
    const dataSets = this.getSelectionAndCategorySets(data, headerCategory, columnB, categoryB);
    const selectionSet = dataSets.selectionSet.map((item) => item[columnB]);
    const categorySet = dataSets.categorySet.map((item) => item[columnB]);

    const minSize = Math.min(selectionSet.length, categorySet.length);

    let intersection = [];
    const filteredSelectionSet = selectionSet.filter((selItem) => {
      const indexB = categorySet.findIndex((catItem) => catItem === selItem);
      if (indexB >= 0) {
        intersection.push(selItem);
        categorySet.splice(indexB, 1);
        return false; // selItem will drop out of selectionSet
      }
      return true;
    });

    const score = intersection.length / minSize;

    return score || 0;
  }

  private calcStudentTest(data, headerCategory: string, columnB: string, categoryB: string): number {
    let dataSets = this.getSelectionAndCategorySets(data, headerCategory, columnB, categoryB);
    let selectionSet = dataSets.selectionSet;
    let categorySet = dataSets.categorySet;

    //slection
    const nSelection = selectionSet.length;
    const selectionValues = selectionSet.map((a) => {return a[columnB]});
    const muSelection = d3.mean(selectionValues);
    const varSelection = d3.variance(selectionValues);

    //category
    const nCategory = categorySet.length;
    const categoryValues = categorySet.map((a) => {return a[columnB]});
    const muCategory = d3.mean(categoryValues);
    const varCategory = d3.variance(categoryValues);

    let scoreP1 = Math.sqrt((nSelection * nCategory * (nSelection + nCategory - 2)) / (nSelection + nCategory));
    let scoreP2 = (muSelection - muCategory) / Math.sqrt((nSelection - 1) * varSelection + (nCategory - 1) * varCategory);
    let score = scoreP1 * scoreP2;

    return score || 0;
  }
  


  private calcMannWhitneyUTest(data, headerCategory: string, columnB: string, categoryB: string): number {
    let dataSets = this.getSelectionAndCategorySets(data, headerCategory, columnB, categoryB);
    let selectionSet = dataSets.selectionSet;
    let categorySet = dataSets.categorySet;

    let selectionRankObj = selectionSet.map((a) => { 
        let returnObj = {set: 'selection'};
        returnObj[columnB] = a[columnB];
        return returnObj; 
      });

    let categoryRankObj = categorySet.map((a) => { 
        let returnObj = {set: 'category'};
        returnObj[columnB] = a[columnB];
        return returnObj; 
      });

    let collectiveRankSet = selectionRankObj.concat(categoryRankObj);
    //sort the set
    collectiveRankSet.sort((a,b) => { return a[columnB] - b[columnB];});

    //assing rank 
    let regionRange = [];
    let region = false;
    for(let i=0;i< collectiveRankSet.length; i++)
    {
      if(i>=1 && collectiveRankSet[i-1][columnB] === collectiveRankSet[i][columnB])
      {
        region = true;
        regionRange.push(i-1); 
        regionRange.push(i); 
      }

      if(region && collectiveRankSet[i-1][columnB] !== collectiveRankSet[i][columnB] && regionRange.length > 1)
      {
        let uniqueRegionRange = regionRange.filter((v,i) => {return regionRange.indexOf(v) === i;});
        let regionRank = (uniqueRegionRange.reduce((a, b) => a + b, 0) + uniqueRegionRange.length) / uniqueRegionRange.length;

        for(let r=0;r<uniqueRegionRange.length; r++)
        {
          collectiveRankSet[uniqueRegionRange[r]]['rank'] = regionRank;
        }
        regionRange = [];
        region = false;
      }

      collectiveRankSet[i]['rank'] = i+1;
      
    }

    if(region && regionRange.length > 1)
    {
      let uniqueRegionRange = regionRange.filter((v,i) => {return regionRange.indexOf(v) === i;});
      let regionRank = (uniqueRegionRange.reduce((a, b) => a + b, 0) + uniqueRegionRange.length) / uniqueRegionRange.length;

      for(let r=0;r<uniqueRegionRange.length; r++)
      {
        collectiveRankSet[uniqueRegionRange[r]]['rank'] = regionRank;
      }
      regionRange = [];
      region = false;
    }


    let selectionRanks = [];
    let categoryRanks = [];

    for(let i=0;i< collectiveRankSet.length; i++)
    { 
      if(collectiveRankSet[i].set === 'selection')
      {
        selectionRanks.push((collectiveRankSet[i] as any).rank);
      }else
      {
        categoryRanks.push((collectiveRankSet[i] as any).rank);
      }
    }

    let nSelection = selectionRanks.length;
    let selectionRankSum = selectionRanks.reduce((a, b) => a + b, 0);
    
    let nCategroy = categoryRanks.length;
    let categoryRankSum = categoryRanks.reduce((a, b) => a + b, 0);    



    // ----- alternative
    // let sBeforeC = 0;
    // let cBeforeS = 0;
    // let TTselectionRanks = [];
    // let TTcategoryRanks = [];
    // for(let i=0;i< collectiveRankSet.length; i++)
    // {
    //   if(collectiveRankSet[i].set === 'selection')
    //   { // selection
    //     TTcategoryRanks.push(cBeforeS);
    //     sBeforeC++;
    //   }else
    //   { // category
    //     TTselectionRanks.push(sBeforeC);
    //     cBeforeS++;
    //   }
    // }



    // console.log('collectiveRankSet: ',collectiveRankSet);
    let selectionU = nSelection * nCategroy + ( nSelection*(nSelection+1)/2) - selectionRankSum;
    let categoryU = nSelection * nCategroy + ( nCategroy*(nCategroy+1)/2) - categoryRankSum;


    // console.log('selectionU: ',selectionU,' | TTselectionRanks-score: ',TTselectionRanks.reduce((a, b) => a + b, 0),' -> array: ',TTselectionRanks);
    // console.log('categoryU: ',categoryU,' | TTcategoryRanks-score: ',TTcategoryRanks.reduce((a, b) => a + b, 0),' -> array: ',TTcategoryRanks);
    // console.log('sBeforeC: ',sBeforeC,' | nSelection: ',nSelection);
    // console.log('cBeforeS: ',cBeforeS,' | nCategroy: ',nCategroy);
    // let minU = Math.min(TTselectionRanks.reduce((a, b) => a + b, 0),TTcategoryRanks.reduce((a, b) => a + b, 0));


    let minU = Math.min(selectionU,categoryU);
    
    let zValue = (minU - (nSelection * nCategroy)/2) / Math.sqrt((nSelection * nCategroy * (nSelection + nCategroy +1))/12);
    // console.log('minU: ',minU);
    console.log('zValue: ',zValue);
    
    //TODO calculate p-value

    let score = zValue;
    return score || 0;
  }

  // --------- MISC ---
  //generates id for the collapseable panel in the accordion with the prefix and the current time's minutes/seconds and millisec
  private getIdWithTimestamp(prefix: string) {
    let currdate = new Date();
    return prefix + <string><any>currdate.getMinutes() + <string><any>currdate.getSeconds() + <string><any>currdate.getMilliseconds();
  }

  //get the 2 data sets depending on the current configuraiton of the dropdowns and the radio buttons
  private getSelectionAndCategorySets(data, headerCategory: string, columnB: string, categoryB: string) {
    const optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;
    const groups = this.ranking.getGroupedData();

    let selectionSet = [];
    if (optionDDA === 'Selection') {
      selectionSet = data.filter((item) => item['selection'] === headerCategory);
    } else if (optionDDA === 'Stratification Groups') {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].name === headerCategory) {
          if (groups.length === 1) {
            selectionSet = data;
          } else {
            selectionSet = groups[i].rows;
          }
        }
      }
    }
    // console.log('selectionSet: ',selectionSet);


    let categorySet = [];
    // use categories or stratification as rows
    if (this.getRadioButtonValue() === 'category' || columnB === 'selection') {
      categorySet = data.filter(item => {
        return item[columnB] === categoryB;
      });
    } else {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].name === categoryB) {
          if (groups.length === 1) {
            categorySet = data;
          } else {
            categorySet = groups[i].rows;
          }
        }
      }
    }
    // console.log('categorySet: ',categorySet);

    let dataSets = {
      selectionSet: selectionSet,
      categorySet: categorySet
    };

    return dataSets;
  }

  // creates data for the visual representation of the jaccard score (parallel sets)
  private getColumnPartioningParallelSets(data: Array<any>, tableHeader: Array<any>, column: any)
  {
    // console.log('---- getColumnPartioning ----');
    // console.log('getColumnPartioning.data',data);
    // console.log('getColumnPartioning.tableHeader',tableHeader);
    // console.log('getColumnPartioning.column',column);
    let columnPartitioning = [];
    let groups = this.ranking.getGroupedData();
    let optionDDA = d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum().label;

    // go through all categories of current coloumn
    for(let i=0; i < column.categories.length; i++)
    {
      let currCategory = column.categories[i];
      //gets ids for the selection column (Selected and Unselected)
      let dataIdCurrCategory = data.filter(item => {return item[''+column.column] === currCategory.label}).map((a) => a.id);

      if(this.getRadioButtonValue() === 'group' && column.column !== 'selection' && currCategory.label !== 'Default') //for stratification radio button
      { //all ids of a cateogry of a column (attribute), but not for selection column or default category group (= no stratification)
        let currGroups = groups.filter(item => {return item.name === currCategory.label});
        let dataIdCurrGroups = [];
        for(let g=0; g<currGroups.length;g++){

          dataIdCurrGroups = ((currGroups[g] as any).rows.map((a) =>  a.id));
        }
        dataIdCurrCategory = dataIdCurrGroups;
      }else if(this.getRadioButtonValue() === 'group' && currCategory.label === 'Default')
      {//all ids of the whole data (default group) when no stratification exist
        dataIdCurrCategory = data.map((a) => a.id);
      }

      let num = dataIdCurrCategory.length;

      let currCategoryParts = {
        categoryLabel: currCategory.label,
        categoryAmount: num,
        parts: []
      };

      // go through all columns in header
      for(let h=0; h<tableHeader.length; h++)
      {
        
        let currHeader = tableHeader[h];
        
        if(currHeader.label.length > 0){
          // let num = data.filter(item => {return item[''+column.column] === currCategory.label}).length;
          // num = !num ? 0 : num;
          let dataIdCurrentHeader = []
          if(optionDDA === 'Selection'){
            dataIdCurrentHeader = data.filter(item => {return item['selection'] === currHeader.label}).map((a) => a.id);
          }else{
            for(let g=0;g<groups.length;g++)
            {
              if(groups[g].name === currHeader.label && (groups[g] as any).rows)
              {
                dataIdCurrentHeader = (groups[g] as any).rows.map((a) => a.id);
              }else if(groups[g].name === currHeader.label && currHeader.label === 'Default')
              {
                dataIdCurrentHeader = data.map((a) => a.id);
              }
            }
          }
          let intersection = dataIdCurrCategory.filter(item => -1 !== dataIdCurrentHeader.indexOf(item));
          let numHeader = intersection.length;

          if(numHeader > 0){
            let currCatForHead = {
              label: currHeader.label,
              amount: numHeader
            };

            currCategoryParts.parts.push(currCatForHead);
          }

        }
      }

      columnPartitioning.push(currCategoryParts);
    }
    // console.log('getColumnPartioning.columnPartitioning',columnPartitioning);
    return columnPartitioning;
  }

  // calculates the backgound color for the scores (0 -> white, 1 -> dark grey)
  private score2color(score:number, domain = [0, 1])
  {
    score = score || 0; // fix undefined or NaN

    const linScale = d3.scale.linear().domain(domain).range([255, 110]);
    const darkness = linScale(score); // higher score -> darker color
    const hslColor =  d3.rgb(darkness, darkness, darkness);
    return hslColor.toString();
  }

  // only the display categories will be shown in table
  private getCategoriesAfterFiltering()
  {
    let allRemainingLabels = ['Selected', 'Unselected', ...this.ranking.getStratificationDesc().categories.map((cat) => cat.label)];
    let columns = this.ranking.getDisplayedAttributes();
    
    for(let i=0; i<columns.length; i++)
    {
      if((<ICategoricalColumn>columns[i]).categories){
        let allColCategories = (<ICategoricalColumn>columns[i]).categories;
        let possibleCategries = [];
        if(columns[i].desc.type === 'categorical' && (<any>columns[i]).currentFilter) {
          console.log('filter-labels: ',(<any>columns[i]).currentFilter.filter);
          possibleCategries = (<any>columns[i]).currentFilter.filter;
        }

        if(possibleCategries.length > 0) {
          for(let i=0; i<allColCategories.length; i++) {
            if(possibleCategries.indexOf(allColCategories[i].label) !== -1){
              allRemainingLabels.push(allColCategories[i].label);
            }
          }
        }else{
          allRemainingLabels = allRemainingLabels.concat(allColCategories.map((a) => a.label));
        }
      }
    }

    return allRemainingLabels;
  }

  private updateItemControls() {
    const dropdownA = d3.select(this.itemTab).select('select.compareA');
    // dropdownA ('With')
    // We append the current data to:
    //  the entry for the selection       (defined in the html)
    //  the entry for the stratification  (defined in the html)

    // Generate a Attribute description that represents the current selection
    const selDesc = this.ranking.getSelectionDesc();
    const selOption = dropdownA.select('option.selection').datum(selDesc); //bind description to option and set text
    selOption.text((desc) => desc.label);

    
    // Generate an attribute description that represents the current stratification
    const stratDesc = this.ranking.getStratificationDesc();
    dropdownA.select('option.stratification').datum(stratDesc).text((desc) => desc.label); //bind description to option and set text

    
    // TODO remove categories which are not displayed
    const dropdownB = d3.select(this.itemTab).select('select.compareB');
    const mode = this.getRadioButtonValue();
    let descriptions: IColumnDesc[] = deepCopy(this.ranking.getDisplayedAttributes().map((col) => col.desc));
    if (mode === 'category') {
      // If Categories is selected:
      //    we generate an entry for every categorical attribute
      //    and an entry representing the selected/unselected items as a attribute with two categories
      //    and an entry representing all these attributes
      descriptions = descriptions.filter((desc) => (<ICategoricalColumnDesc>desc).categories);
      descriptions.forEach((desc) => {
        (desc as any).categories = (this.ranking.getDisplayedAttributes().filter((child) => child.label == desc.label)[0] as CategoricalColumn).categories;
      });
      descriptions.unshift(this.ranking.getSelectionDesc());
      descriptions.unshift({ //There is always at least the selection as categorical column
        label: 'All categorical columns',
        type: 'cat_collection'
      });
    } else { //mode is 'group
      // Stratification is selected:
      //    we can also compare non catgegorical attribute
      //    so we generate an entry for every attribute (categorical, numerical, string, and maybe more(?))
      //    and an entry representing the selected/unselected items as a attribute with two categories
      //    and an entry representing the ranked order of items as numerical attribute
      //    and an entry representing the current stratification as categorical attribute
      //    and an entry representing the numerical attributes (if there are any)
      //    and an entry representing the categorical attributes (if there are any)
      //    and an entry representing all these attributes
      descriptions = descriptions.filter((desc) => ['categorical', 'number'].includes(desc.type)); // filter attributes by type
      descriptions.forEach((desc) => {
        (desc as any).categories = stratDesc.categories; // Replace real categopries with those from stratification
      });
      descriptions.unshift(this.ranking.getSelectionDesc());
      descriptions.unshift(this.ranking.getRankDesc())
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
    }

    const options = dropdownB.selectAll('option').data(descriptions, (desc) => desc.label); //bin data, label is key
    options.enter().append('option').text((desc) => desc.label); //enter: add columns to dropdown, that were added by the user
    // update: nothing to do
    options.exit().remove(); // exit: remove columns no longer displayed
    options.order(); // order domelements as in the array
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
      console.log('start touring')
      //if touring is displayed, ensure the panel is visible
      this.collapse = false;
    }
    
    const button = d3.select(this.node).select('.lu-side-panel button.touring')
    button.classed('active', !hide);
  }

  private prepareInput = (desc) => {
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

    return d3.select(this.itemTab).select('select.itemControls.compareB').selectAll('option').data().filter((desc) => filter.includes(desc.type));;
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

  private getRadioButtonValue() {
    return d3.select(this.itemTab).select('input[name="compareGroup"]:checked').property('value');
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

  /**
   *  Contains no selection, rank or score data!
   */
  private getItems() {
    return this.provider.data;
  }

  private getScoreColumns() {
    return this.getDisplayedAttributes().filter((attr) => (attr.desc as any)._score);
  }


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
  public getItemsDisplayed() {
    const databaseData = new Array();

    let rank = 0;
    const scoreCols = this.getScoreColumns();
    const scoresData = [].concat(...scoreCols.map((col) => this.getScoreData(col.desc)));


    // get currently displayed data
    this.getItemOrder().forEach(rowId => { // use order instead of ids for quick access on provider.data array (ids are strings)
      const row = this.getItems()[rowId]; // row
      row.rank = rank++; //set rank and increment
      // include wether the row is selected
      row.selection = this.getSelection().includes(rowId) ? 'Selected' : 'Unselected'; // TODO compare perfomance with assiging all Unselected and then only set those from the selection array
      databaseData.push(row);
    });

    // merge score and database data
    const currentData = [...databaseData.concat(scoresData)
      .reduce((map, curr) => {
        map.has(curr.id) || map.set(curr.id, {}); //include id in map if not already part of it, initialize with empty object
        
        const item = map.get(curr.id); // get stored data for this id

        Object.entries(curr).forEach(([k, v]) =>
          item[k] = v // add the content of the current array item to the data already stored in the map's entry (overwrites if there are the same properties in databaseData and scoreColumn)
        );
        
        return map;
      }, new Map()).values()]; // give map as input and return it's value

    return currentData;
  }

  private getItemOrder() {
    // order is always defined for groups (rows (data) only if there is an stratification)
    return [].concat(...this.getRanking().getGroups().map((grp) => grp.order)); // Map groups to order arrays and concat those

  }

  public getDisplayedIds() {
    const items = this.getItems();
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
   * Contains no selection, rank or score data!
   */
  public getGroupedData() {
    const data = this.getItemsDisplayed();

    let groups = []

    for ( let grp of this.getRanking().getGroups()) {
      groups.push({
        name: grp.name,
        color: grp.color,
        rows: grp.order.map((id) => data.find((item) => item._id === id))
      });
    }
    return groups;
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