import {ICategoricalColumnDesc, ICategoricalColumn, LocalDataProvider, IColumnDesc, ICategory, CategoricalColumn, createImpositionBoxPlotDesc} from 'lineupjs';
import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, ISImilarityMeasure, MeasureMap} from 'touring';
import * as d3 from 'd3';
import 'd3.parsets';
import { isBuffer } from 'util';

export default class TouringLineUpPanel extends LineUpPanelActions {

  private static EVENTTYPE = '.touring';
  private touringElem: HTMLElement;
  private columnOverview: HTMLElement; searchbox: HTMLElement; itemCounter: HTMLElement; // default sidepanel elements
  private itemTab: Node; attributeTab: Node;


  protected init() {
    super.init();

    this.node.insertAdjacentHTML('beforeend', panelHTML);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');

    this.columnOverview = <HTMLElement>this.node.querySelector('main')!; // ! = bang operator --> can not be null
    this.searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
    this.itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

    this.itemTab = d3.select(this.node).select('#itemTouring').node();
    this.attributeTab = d3.select(this.node).select('#attributeTouring').node();

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-calculator', () => {
      this.toggleTouring();

      console.log('provider', this.provider);
      console.log('provider.getSelection: ', this.provider.getSelection(), ' of ', this.provider.getTotalNumberOfRows());
      console.log('provider.selectedRows: ', this.provider.selectedRows());
      console.log('provider.getColumns: ', this.provider.getColumns());
      console.log('provider.getRanking: ', this.provider.getRankings());
      console.log('getGroups', this.provider.getRankings()[0].getGroups())
      console.log('provider.getRankings()[0].children: ', this.provider.getRankings()[0].children);
      console.log('provider.getFilter: ', this.provider.getFilter()); //TODO use filter
      console.log('data', this.provider.data);
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
    d3.select(this.node).selectAll('select').on('input', () => this.updateTouringData());




    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores 
    //  if no items are selected, the table should be displayed by a message
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringData()); //fat arrow to preserve scope in called function (this)

    // column of a table was added
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringData());

    // column of a table was removed
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringData());

    // for filter changes and stratification changes
    //  After the number of items has changed, the score change aswell
    // If the stratification changes, the "Stratification" attribute and possibly the table has to be changed
    this.provider.on(LocalDataProvider.EVENT_ORDER_CHANGED + TouringLineUpPanel.EVENTTYPE, () => this.updateTouringData());
  }

  private updateTouringData() {
    if (d3.select(this.itemTab).classed('active')) {
      this.updateItemTab();
    } else if (d3.select(this.attributeTab).classed('active')) {
      this.updateAttributeTab();
    }
  }

  private updateItemTab() {
    this.updateItemControls();
    this.updateItemScores();
  }

  private updateItemScores() {
    const currentData = this.getDisplayedData();
    console.log('current data: ', currentData);

    const inputA = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum());
    const inputB = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareB').select('option:checked').datum());

    console.log('Inputs to get set measures.', 'A', inputA, 'B', inputB);
    const setMeasures: MeasureMap = MethodManager.getSetMethods(inputA, inputB);
    console.log('set measures for current data', setMeasures);

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
    // TODO
    // this.updateAttributeControls();
    // this.updateAttributeScores();
  }


  //generates id for the collapseable panel in the accordion with the prefix and the current time's minutes/seconds and millisec
  private getIdWithTimestamp(prefix: string) {
    let currdate = new Date();
    return prefix + <string><any>currdate.getMinutes() + <string><any>currdate.getSeconds() + <string><any>currdate.getMilliseconds();
  }


  private createAccordionItem(panelGroup: any, collapseDetails: any) {
    if (collapseDetails && collapseDetails instanceof Object &&
      collapseDetails.groupId && typeof collapseDetails.groupId === 'string' &&
      collapseDetails.id && typeof collapseDetails.id === 'string' &&
      collapseDetails.label && typeof collapseDetails.label === 'string') {
      let panel = panelGroup.append('div')
        .attr('class', 'panel');

      let panelHeading = panel.append('div')
        .attr('class', 'panel-heading')
        .attr('role', 'tab')
        .append('h4')
        .attr('class', 'panel-title') //multiple expanded accordions
        .html(`<a data-toggle="collapse" href="#${collapseDetails.id}">${collapseDetails.label}</a>`) //single expanded accordion
      //.html(`<a data-toggle="collapse" data-parent="#${collapseDetails.groupId}" href="#${collapseDetails.id}">${collapseDetails.label}</a>`)

      let panelCollapse = panel.append('div')
        .attr('class', 'panel-collapse collapse')
        .attr('id', collapseDetails.id);

      if (collapseDetails.default) {
        panelCollapse.classed('in', true); //accordion item is expanded
      }

      let panelBody = panelCollapse.append('div')
        .attr('class', 'panel-body');
    }
  }


  private insertMeasure(measure: ISImilarityMeasure, collapseId: string, currentData: Array<any>) {
    if (measure && measure.id === 'jaccard') {
      this.generateJaccardTable(collapseId, currentData);
      
      
    } else {
      // this.drawTable(collapseId);
      this.generateMeasureTable(collapseId,this.generateTableLayout(currentData));
      // this.generateTableLayout();
    }
  }

  private generateTableLayout(data: Array<any>)
  {
    let generatedTable = {
      tableHead: [],
      tableBody: []
    };
    
    // TABLE HEADER
    generatedTable.tableHead = this.getTableHeader();
    // let tableHeaders = this.getTableHeader();
    // let tableNumbOfCol = tableHeaders.length;
    // let tableHead = [];
    // for(let i = 0; i < tableNumbOfCol; i++) {
    //   let headCell = {
    //     columnName: 'col'+i,
    //     label: tableHeaders[i]
    //   };
    //   tableHead.push(headCell);
    // }
    // generatedTable.tableHead = deepCopy(tableHead);

    // TABLE BODY 
    // check filter
    generatedTable.tableBody  = this.getTableBody(generatedTable.tableHead, data);

    
    console.log('generateTableLayout: ',generatedTable);
    return generatedTable;
  }

  //generate table header depending on the dropdown A option
  private getTableHeader()
  {
    // let tableHeaders = ['','','Selected','Unselected'];
    let tableHeaders = [];
    // TODO: create the needed table headers
    let optionDDA = d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum().label;
    console.log('DD1',optionDDA);

    if(optionDDA === 'Selection'){

      tableHeaders = [
        { columnName: 'col1', label: '', colour: '#ffffff'},
        { columnName: 'col2', label: '', colour: '#ffffff'},
        { columnName: 'col3', label: 'Selected', colour: '#ffffff'},
        { columnName: 'col4', label: 'Unselected', colour: '#ffffff'},
      ];

    }else if (optionDDA === 'Stratification Groups')
    {
      let allStratificationGroups = this.getStratificationDesc();
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

  private getTableBody(tableHeader: Array<any>, data: Array<any>)
  {
    let tableBody = [];

    const chosenColumns = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareB').select('option:checked').datum());
    console.log('generateTableLayout - chosenColumns: ', chosenColumns);
      

    let showCategoriesAfterFilter = this.getCategoriesAfterFiltering();
    console.log('generateTableLayout - remaining labels: ',showCategoriesAfterFilter);


    if(this.getRadioButtonValue() === 'category'){

      for(let i=0; i<chosenColumns.length; i++)
      {
        let currCol = chosenColumns[i];
        
        for(let cnt=0; cnt < currCol.categories.length; cnt++)
        {
          let currCategory = currCol.categories[cnt];
          if(showCategoriesAfterFilter.indexOf(currCategory.label) !== -1){

            let tableRow = {};
            
            for(let col=0; col < tableHeader.length; col++)
            {
              let colName = ((tableHeader[col] as any).columnName as string);
              
              if(col === 0) //first column (categorical column)
              {
                tableRow[colName] = {
                  label: currCol.label,
                  rowspan: (cnt === 0) ? currCol.categories.length : 0                
                };

              }else if(col === 1)  //second column (categoroies of categircal column)
              {
                tableRow[colName] = {
                  label: currCategory.label,
                  color: currCategory.color
                };

              }else //all the other columns
              {
                let score = this.calcJaccardScore(data, (tableHeader[col] as any).label, currCol.column, currCategory.label);
                tableRow[colName] = {
                  label: score, 
                  column: currCol.column,
                  column_label: currCol.label,
                  category: currCategory.label,
                  color: this.score2color(score),
                  action: true,
                  // allData: this.getCategoryPartioning(currentItems,currCol), //TODO --> genertae Object for the detail view (parallel sets grafics)
                  // selected: this.getCategoryPartioning(selectedData,currCol)
                };
              }
            }
            // const scoreSelected = this.calcJaccard(currentItems, 'selection', 'Selected', currCol.column, currCategory.label);
            // const scoreDeselected = this.calcJaccard(currentItems, 'selection', 'Unselected', currCol.column, currCategory.label);

            tableBody.push(tableRow);
          }
        }
      }
    }else{
      //TODO generate table for stratificaiton option of radio button
    }


    return tableBody;
  }

  private generateMeasureTable(containerId: string, dataTable: any)
  {
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
    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    let cells = rows.selectAll('td')
                    .data(function(row) {
                      // he does it this way to guarantee you only use the
                      // values for the columns you provide.
                      return dataTable.tableHead.map(function(column) {
                          // return a new object with a value set to the row's column value.
                          return {value: row[column.columnName]};
                      });
                    })
                    .enter()
                    .append('td')
                    .attr('class','text-center')
                    // .attr("rowspan", function(d){
                    //   if(d.value.rowspan){
                    //     return d.value.rowspan;
                    //   }
                    //   return 1;
                    //  })
                    .text(function(d:any) { 
                      if(d.value.label && Number(d.value.label.toString())) {
                        return Number(d.value.label.toString()).toFixed(2);  
                      }

                      return d.value.label; 
                    })
                    .style("background-color", function(d:any){
                      return d.value.color || '#ffffff';
                     })
                    .on("mouseover", function(d:any) {
                      if(d.value.action) {
                        //d3.select(this).classed('bg-primary',true);
                        d3.select(this).style("background-color", function(d){
                                                                    return '#fba74d';
                                                                  })
                                      .style("font-weight", 'bolder');                                      
                      }
                    })					
                    // FIXME: change colour of text depending on background (balck on black -> bad)
                    .on("mouseout", function(d:any) {
                      if(d.value.action) {
                        //d3.select(this).classed('bg-primary',false);
                        d3.select(this).style("background-color", function(d){
                                                                    return d.value.color || '#ffffff';
                                                                  })
                                      .style("font-weight", 'normal'); 
                      }
                    });
                    // .on('click', function(d:any) {
                    //   if(d.value.action) {
                    //     that.showVisualRepresentation(containerId,d);
                    //   }
                    // });                
  }

  private generateJaccardTable(containerId: string, currentData: Array<any>) {
    const that = this;

    let columnHeaders = [
      { head: 'col1', label: ''},
      { head: 'col2', label: ''},
      { head: 'col3', label: 'Selected'},
      { head: 'col4', label: 'Unselected'},
    ];

    let jaccardScores = this.calculateJaccardScores(currentData);
    console.log('jaccardScores: ', jaccardScores);
    
    // create table with D3
    let tableContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','table-container');

    let table = tableContainer.append('table')
                        .attr('class','table table-condensed');
    let tableHeader = table.append('thead');
    tableHeader.append('tr')
              .selectAll('th')
              .data(columnHeaders)
              .enter()
              .append('th')
              .attr('class','text-center')
              .text(function(d) { return d.label; })
              .each(function (d, i) {
                    if (i === 0 || i === 1) {
                      d3.select(this).classed("rowspan",true);
                    } 
                  });

    let tableBody = table.append('tbody');
    
/*     jaccardScores.forEach(function (d) {
          var tr = tableBody.append("tr");
          console.log(d);
          if (d.col1.rowspan >0) {
              tr.append("td")
                  .attr("rowspan", d.col1.rowspan)
                  .attr('class','text-center align-middle')
                  .text(d.col1.label)
                  .style("background-color", d.col1.color);
          }
          tr.append("td")
              .attr('class','text-center')
              .text(d.col2.label);
          tr.append("td")
              .attr('class','text-center')
              .text(d.col3.label);
          tr.append("td")
              .attr('class','text-center')
              .text(d.col4.label);

          // Add a click handler that will return the datum instead of undefined
          tr.on('click', function(tr) {
            console.log('Row Clicked');
            console.log(tr);
          });    
  
    }); */
    
    // create a row for each object in the data
    let rows = tableBody.selectAll('tr')
                      .data(jaccardScores)
                      .enter()
                      .append('tr');

    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    let cells = rows.selectAll('td')
                    .data(function(row) {
                      // he does it this way to guarantee you only use the
                      // values for the columns you provide.
                      return columnHeaders.map(function(column) {
                          // return a new object with a value set to the row's column value.
                          return {value: row[column.head]};
                      });
                    })
                    .enter()
                    .append('td')
                    .attr('class','text-center')
                    // .attr("rowspan", function(d){
                    //   if(d.value.rowspan){
                    //     return d.value.rowspan;
                    //   }
                    //   return 1;
                    //  })
                    .text(function(d) { 
                      if(d.value.label && Number(d.value.label.toString())) {
                        return Number(d.value.label.toString()).toFixed(2);  
                      }

                      return d.value.label; 
                    })
                    .on('click', function(d) {
                      if(d.value.action) {
                        that.showVisualRepresentation(containerId,d);
                      }
                    })
                    .style("background-color", function(d){
                      return d.value.color || '#ffffff';
                     })
                     .on("mouseover", function(d) {
                        if(d.value.action) {
                          //d3.select(this).classed('bg-primary',true);
                          d3.select(this).style("background-color", function(d){
                                                                      return '#fba74d';
                                                                    })
                                        .style("font-weight", 'bolder');                                      
                        }
                      })					
                      // FIXME: change colour of text depending on backgraunf (balck on black -> bad)
                      .on("mouseout", function(d) {
                        if(d.value.action) {
                          //d3.select(this).classed('bg-primary',false);
                          d3.select(this).style("background-color", function(d){
                                                                      return d.value.color || '#ffffff';
                                                                    })
                                        .style("font-weight", 'normal'); 
                        }
                      });
                    // .each(function (d, i) {
                    //     if (d.value.rowspan) {
                    //       // put all your operations on the second element, e.g.
                    //       if(d.value.rowspan > 0) {
                    //         d3.select(this).attr("rowspan", d.value.rowspan);
                    //       }else
                    //       {
                    //         d3.select(this).classed('hide', true);
                    //       }
                    //     } 
                    //   });

    
    
    // console.log('cells',cells);
    // cells.on('click', function(cell) {
    //   that.showVisualRepresentation(containerId,cell);
    // });                  

  }

  private showVisualRepresentation(containerId: string, cell: any)
  {
    console.log('Cell clicken: ',cell);

    let oldSvgContainer = d3.select(this.itemTab).select('div[class="svg-container"]');
    oldSvgContainer.remove(); //deletes all generated content im 'measuresDivElement'

    let svgContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','svg-container');
  
    let width = svgContainer.style('width').slice(0,-2);
    let currData = [];
    let columnLabel = ''+cell.value.column_label;

    for(let i = 0; i < cell.value.selected.length; i++)
    {
      let currCategoryLabel = ''+cell.value.selected[i].label;

      //selected
      let selectedAmount = (cell.value.selected[i].amount as number);
      if(selectedAmount > 0)
      {
        let rowSelected = {};
        rowSelected[''+columnLabel] = (cell.value.selected[i].label as string);
        rowSelected['Selection'] = 'Selected';
        rowSelected['value'] = selectedAmount;
        currData.push(rowSelected);
      }

      //unselected
      let unselectedAmount = (cell.value.allData[i].amount as number)-(cell.value.selected[i].amount as number);
      if(unselectedAmount > 0)
      {
        
        let rowUnselected = {};
        rowUnselected[''+columnLabel] = (cell.value.selected[i].label as string);
        rowUnselected['Selection'] = 'Unselected';
        rowUnselected['value'] = unselectedAmount;
        currData.push(rowUnselected);
      }

    }

    console.log('currentData',currData);

    const that = this;

    // console.log('SVG Conatiner - width: ',width);
    let chart = (<any>d3).parsets()
                        .tension(0.5) //[0 .. 1] -> 1 = straight line 
                        .dimensions([columnLabel, 'Selection'])
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
    svgFigureGroup.datum(currData).call(chart);
    
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

                              // console.log('path.parent.name: ',d.parent.name);
                              // console.log('cell.category: ',currCategory);

                              // d3.select(this).attr('fill',that.getColorOfCategory(d.parent.dimension,d.parent.name));
                              // console.log('fill color: ',that.getColorOfCategory(d.parent.dimension,d.parent.name));
                              if(d.parent.name === cell.value.category && d.name === cell.value.tableColumn){
                                d3.select(this).classed('selected',true);
                              }
                              console.log('path.this: ', d3.select(this));
                              console.log('path.d: ',d);
                            });
    // console.log('svgPaths: ',svgPaths);

    let svgDimensions = svgFigureGroup.selectAll('g[class=dimension]');
    // console.log('svgDimensions',svgDimensions);
   
    //highlight label of current path
    svgDimensions.selectAll('g')
                 .each(function(d) {
                  // d3.select(this).classed('selected',false);
                  d3.select(this).select('rect').classed('selected',false);
                  // console.log('dim.d: ',d);
                  // console.log('dim.this: ',d3.select(this));

                  if(d.name === cell.value.category){
                    d3.select(this).select('rect').classed('selected',true);
                  }
                  
                });

    


  }

  // private getColorOfCategory(column: string, category: string)
  // {
  //   // console.log('column: ',column,' ¡ category',category);
  //   let categoryColor = '#ffffff';
  //   let allColumns = this.provider.getRankings()[0].children;
  //   // console.log('allColumns: ',allColumns);
  //   let allCategories = {};

  //   for(let i =0; i<allColumns.length; i++){

  //     if(allColumns[i].desc.label == column)
  //     {
  //       // console.log('the right column: ',column);
  //       let currColCat = (allColumns[i] as ICategoricalColumn).categories;
  //       // console.log('currColCat: ',currColCat);
  //       if(<any>currColCat !== 'undefined'){
  //         for(let cnt=0; cnt < currColCat.length; cnt++)
  //         {
  //           if(currColCat[cnt].label === category)
  //           {
  //             // console.log('the right category: ',category);
  //             return currColCat[cnt].color;
  //           }
  //         }
  //       }
  //     }
  //   }
    
  //   return categoryColor;
  // }
  
  private calcJaccard(items, columnA: string, categoryA: string, columnB: string, categoryB: string): number {

    const selectionSet = items.filter(item => {
      return item[columnA] === categoryA;
    });

    const categorySet = items.filter(item => {
      return item[columnB] === categoryB;
    });

    const intersection = selectionSet.filter(item => -1 !== categorySet.indexOf(item));

    const unionArrays = function (a, b, equals){
      return a.concat(b).reduce( (acc, element) => {
          return acc.some(elt => equals(elt, element))? acc : acc.concat(element)
      }, []);
    }
    const union = unionArrays(selectionSet, categorySet, (a, b) => a._id === b._id);

    const score = intersection.length / union.length;
    
    //console.log('score', score);

    return score || 0;
  }

  // private calcJaccardScore(data, headerOption: string, headerCategory: string, columnB: string, categoryB: string): number 
  // {
  //   let score = 0;
  //   let radioButtonValue = this.getRadioButtonValue();
  //   if(radioButtonValue === 'Selection'){
  //     return this.calcJaccardSelection(data, 'selection',headerCategory,columnB,categoryB);
      
  //   }else if(radioButtonValue === 'Stratification Group'){
  //     return this.calcJaccardGroup(data,headerCategory,columnB,categoryB);

  //   }

  //   return score;
  // }

  private calcJaccardScore(data, headerCategory: string, columnB: string, categoryB: string): number {

    let optionDDA = d3.select(this.itemTab).select('select.itemControls.compareA').select('option:checked').datum().label;
    let selectionSet = [];

    if(optionDDA === 'Selection'){
      selectionSet = data.filter(item => {
        return item['selection'] === headerCategory;
      });

    }else if(optionDDA === 'Stratification Groups'){
      let groups = this.provider.getRankings()[0].getGroups();
      for(let i=0; i<groups.length; i++){
        if(groups[i].name === headerCategory)
        {
          selectionSet = (groups[i] as any).rows.map((a) => {return a.v;});
        }
      }

    }
    // const selectionSet = data.filter(item => {
    //   return item[columnA] === categoryA;
    // });

    const categorySet = data.filter(item => {
      return item[columnB] === categoryB;
    });

    const intersection = selectionSet.filter(item => -1 !== categorySet.indexOf(item));

    const unionArrays = function (a, b, equals){
      return a.concat(b).reduce( (acc, element) => {
          return acc.some(elt => equals(elt, element))? acc : acc.concat(element)
      }, []);
    }
    const union = unionArrays(selectionSet, categorySet, (a, b) => a._id === b._id);

    const score = intersection.length / union.length;
    
    //console.log('score', score);

    return score || 0;

    // return this.calcJaccard(data, headerOption, headerCategory,columnB,categoryB);
  }

  // private calcJaccardGroup(data, headerCategory: string, columnB: string, categoryB: string) : number
  // {
  //   let groups = this.provider.getRankings()[0].getGroups();
  //   for(let i=0; i<groups.length; i++){
  //     if(groups[i].name === headerCategory)
  //     {

  //     }
  //   }
  //   return 0;
  // }

  // calculated jaccard score
  private calculateJaccardScores(currentItems: Array<any>)
  {
    const chosenColumns = this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareB').select('option:checked').datum());
    console.log('chosenColumns d3: ', this.prepareInput(d3.select(this.itemTab).select('select.itemControls.compareB').select('option:checked').datum()));
    
    let showCategoriesAfterFilter = this.getCategoriesAfterFiltering();
    console.log('remaining labels: ',showCategoriesAfterFilter);
  
    let selectedData = currentItems.filter((data) => {return data.selection === 'Selected'});

    let jaccardScores = [];

    for(let i=0; i<chosenColumns.length; i++)
    {
      let currCol = chosenColumns[i];
      
      for(let cnt=0; cnt < currCol.categories.length; cnt++)
      {
        let currCategory = currCol.categories[cnt];
        if(showCategoriesAfterFilter.indexOf(currCategory.label) !== -1){
          const scoreSelected = this.calcJaccard(currentItems, 'selection', 'Selected', currCol.column, currCategory.label);
          const scoreDeselected = this.calcJaccard(currentItems, 'selection', 'Unselected', currCol.column, currCategory.label);

          let resultObj = {
            col1: {
              label: currCol.label,
              rowspan: (cnt === 0) ? currCol.categories.length : 0                
            },
            col2: {
              label: currCategory.label,
              color: currCategory.color
            },
            col3: {
              label: scoreSelected,
              column: currCol.column,
              column_label: currCol.label,
              category: currCategory.label,
              color: this.score2color(scoreSelected),
              action: true,
              allData: this.getCategoryPartioning(currentItems,currCol),
              selected: this.getCategoryPartioning(selectedData,currCol),
              tableColumn: 'Selected'
            },
            col4: {
              label: scoreDeselected,
              column: currCol.column,
              column_label: currCol.label,
              category: currCategory.label,
              color: this.score2color(scoreDeselected),
              action: true,
              allData: this.getCategoryPartioning(currentItems,currCol),
              selected: this.getCategoryPartioning(selectedData,currCol),
              tableColumn: 'Unselected'
            }
          };


          jaccardScores.push(resultObj);
        }
      }
    }

    return jaccardScores;
  }

  private getCategoryPartioning(data: Array<any>, column: any)
  {
    let categoryPartioning = [];
    for(let i=0; i < column.categories.length; i++)
    {
      let currCategory = column.categories[i];
      let num = data.filter(item => {return item[''+column.column] === currCategory.label}).length;
      num = !num ? 0 : num;
      let currCategoryPart = {
        label: currCategory.label,
        amount: num
      };
      categoryPartioning.push(currCategoryPart);

    }

    return categoryPartioning;
  }

  private score2color(score:number, domain = [0, 1])
  {
    score = score || 0; // fix undefined or NaN

    const linScale = d3.scale.linear().domain(domain).range([255, 110]);
    const darkness = linScale(score); // higher score -> darker color
    const hslColor =  d3.rgb(darkness, darkness, darkness);
    return hslColor.toString();
  }
  
  private getCategoriesAfterFiltering()
  {
    let allRemainingLabels = ['Selected', 'Unselected', ...this.getStratificationDesc().categories.map((cat) => cat.label)];
    let columns = this.provider.getRankings()[0].children;
    
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


  // draw table
  private drawTable(containerId: string) {
    // let measuresDivElement = d3.select('div[class="measures"]');
    let tableContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','table-container');

         
    // let columnHeaders = [
    //   { head: 'One', cl: ''},
    //   { head: 'Two', cl: ''},
    //   { head: 'Selected', cl: ''},
    //   { head: 'Unselected', cl: ''}
    // ];
    let columnHeaders = ['One','Two','Selected','Unselected'];

    let data = [
      {One: 'Cat1', Two: 'A',Selected: 0.5 ,Unselected: 0.1},
      {One: 'Cat1', Two: 'B',Selected: 0.5 ,Unselected: 0.1},
      {One: 'Cat2', Two: 'a',Selected: 0.5 ,Unselected: 0.1},
      {One: 'Cat2', Two: 'b',Selected: 0.5 ,Unselected: 0.1},
      {One: 'Cat2', Two: 'c',Selected: 0.5 ,Unselected: 0.1},
      {One: 'Cat2', Two: 'd',Selected: 0.5 ,Unselected: 0.1}
    ];


    let table = tableContainer.append('table')
                        .attr('class','table table-condensed');
    let tableHeader = table.append('thead');
    tableHeader.append('tr')
              .selectAll('th')
              .data(columnHeaders)
              .enter()
              .append('th')
              .text(function(d) { return d; });


    let tableBody = table.append('tbody');
    // create a row for each object in the data
    var rows = tableBody.selectAll('tr')
                    .data(data)
                    .enter()
                    .append('tr');

    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    var cells = rows.selectAll('td')
                  .data(function(row) {
                    // he does it this way to guarantee you only use the
                    // values for the columns you provide.
                    return columnHeaders.map(function(column) {
                        // return a new object with a value set to the row's column value.
                        return {value: row[column]};
                    });
                  })
                  .enter()
                  .append('td')
                  .attr('class','text-center')
                  .text(function(d) { return d.value; });
  }


  private updateItemControls() {
    const dropdownA = d3.select(this.itemTab).select('select.itemControls.compareA');
    // dropdownA ('With')
    // We append the current data to:
    //  the entry for the selection       (defined in the html)
    //  the entry for the stratification  (defined in the html)

    // Generate a Attribute description that represents the current selection
    const selDesc = this.getSelectionDesc();
    console.log('selDesc', selDesc);
    const selOption = dropdownA.select('option.selection').datum(selDesc); //bind description to option and set text
    selOption.text((desc) => desc.label);

    
    // Generate an attribute description that represents the current stratification
    const stratDesc = this.getStratificationDesc();
    dropdownA.select('option.stratification').datum(stratDesc).text((desc) => desc.label); //bind description to option and set text

    
    // TODO remove categories which are not displayed
    const dropdownB = d3.select(this.itemTab).select('select.itemControls.compareB');
    const mode = this.getRadioButtonValue();
    let descriptions: IColumnDesc[] = deepCopy(this.provider.getRankings()[0].children.map((col) => col.desc));
    if (mode === 'category') {
      // If Categories is selected:
      //    we generate an entry for every categorical attribute
      //    and an entry representing the selected/unselected items as a attribute with two categories
      //    and an entry representing all these attributes
      descriptions = descriptions.filter((desc) => (<ICategoricalColumnDesc>desc).categories);
      descriptions.forEach((desc) => {
        (desc as any).categories = (this.provider.getRankings()[0].children.filter((child) => child.label == desc.label)[0] as CategoricalColumn).categories;
      });
      descriptions.unshift(this.getSelectionDesc());
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
      descriptions.unshift(this.getSelectionDesc());
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

    //changing the radio button or the removing columns could create a different selection in the dropdowns
    //therefore the touring data will be updated
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
  }

  private getDisplayedData() {
    const currentData = new Array();

    // get currently displayed data
    this.provider.getRankings()[0].getGroups().forEach((stratGroup) => {
      // order is always defined for groups
      stratGroup.order.forEach((rowId) => { 
        // include wether the row is selected
        const row = this.provider.data[rowId];
        row.selection = this.provider.getSelection().includes(rowId) ? 'Selected' : 'Unselected';

        // TODO score columns are missing from this.provider.data
        currentData.push(row);
        });
    })

    return currentData;
  }


  private getSelectionDesc() {
    const selCategories = new Array<ICategory>();
    const numberOfRows = this.provider.getRankings()[0].getGroups().map((group) => group.order.length).reduce((prev, curr) => prev + curr); // get length of stratification groups and sum them up
    console.log('Selected ', this.provider.getSelection().length, 'Total ', numberOfRows);
    if (this.provider.getSelection().length > 0) {
      selCategories.push({name: 'Selected', label: 'Selected', value: 0, color: '#1f77b4', });
    } // else: none selected

    if (this.provider.getSelection().length < numberOfRows) {
      selCategories.push({name: 'Unselected', label: 'Unselected', value: 1, color: '#ff7f0e', })
    } // else: all selected

    return {
      categories: selCategories,
      label: 'Selection',
      type: 'categorical',
      column: 'selection'
    };
  }

  private getStratificationDesc() {
    return {
      categories: this.provider.getRankings()[0].getGroups().map((group) => ({
        name: group.name,
        label: group.name
        // TODO get colors of stratification
      })), // if not stratifified, there is only one group ('Default')
      label: 'Stratification Groups',
      type: 'categorical',
      column: 'strat_groups'
    }
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