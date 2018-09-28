import {ICategoricalColumnDesc,ICategoricalColumn, SidePanel, spaceFillingRule, IGroupSearchItem, exportRanking, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, isCategoricalColumn} from 'lineupjs';
import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, Type, ISImilarityMeasure, MeasureMap} from 'touring';
import * as d3 from 'd3';
import 'd3.parsets';
import titanic from 'file-loader!./titanic.csv'
import {IServerColumn} from '../../rest';

export default class TouringLineUpPanel extends LineUpPanelActions {

  private static EVENTTYPE = '.touring';
  private touringElem : HTMLElement;
  private columnOverview : HTMLElement; searchbox : HTMLElement; itemCounter : HTMLElement; // default sidepanel elements
  private extraStartificationOptions = [
    {
      label: 'All displayed Attributes',
      before: 1
    },
    {
      label: 'All numerical Attributes',
      before: 2
    },
    {
      label: 'Rank',
      before: 3
    }
  ];

  

  protected init() {
    super.init();

    this.node.insertAdjacentHTML('beforeend', panelHTML);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');
    
    this.columnOverview = <HTMLElement>this.node.querySelector('main')!;
    this.searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
    this.itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-calculator', () => {
      this.toggleTouring();
      
      // console.log('provider',this.provider);
      // console.log('provider.getSelection: ',this.provider.getSelection(), ' of ', this.provider.getTotalNumberOfRows());
      // console.log('provider.selectedRows: ',this.provider.selectedRows());
      console.log('provider.getColumns: ',this.provider.getColumns());
      // console.log('provider.getRanking: ',this.provider.getRankings());
      // console.log('getGroups', this.provider.getRankings()[0].getGroups())
      console.log('provider.getRankings()[0].children: ',this.provider.getRankings()[0].children);
      // console.log('provider.getFilter: ',this.provider.getFilter()); //TODO use filter
      // console.log('data', this.provider.data)
      // console.log('------------------------------------');

      
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
      console.log('radio button value: ',radio.property('value'), ' | object: ', radio);

      this.updateDropdowns()
    });

    // changes made in dropdowns
    //    cause changes  the displayed table / scores 
    d3.select(this.node).selectAll('select.itemControls').on('input',() => {
      console.log('changed dropdown value. A:', d3.selectAll('select.itemControls.compareA').property("value"), '\t|B: ', d3.selectAll('select.itemControls.compareB').property("value"));
      this.updateTouringData();
    });



    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection
    //  might cause changes the displayed table / scores 
    //  if no items are selected, the table should be displayed by a message
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED+TouringLineUpPanel.EVENTTYPE, () => this.updateTouringData()); //fat arrow to preserve scope in called function (this)

    // column of a table was added
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN+TouringLineUpPanel.EVENTTYPE, () =>this.updateDropdowns());

    // column of a table was removed
    //  causes changes in the second item dropdown (b)
    //  might cause changes the displayed table / scores 
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN+TouringLineUpPanel.EVENTTYPE, () => this.updateDropdowns());
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
    return this.provider.getRankings()[0].children.map((col) => col.desc).filter((desc) => filter.includes(desc.type));;
  }
  
  private updateTouringData() {
    //console.log('update touring data');

    let chosenOptions = this.getChosenOptions();
    //console.log('chosenOptions',chosenOptions);
    let currentData = this.provider.data;


    // ---- Compare A : Selection -------------------
    if(chosenOptions.compareItemA === 'Selection')
    {
      let selectedIndices = this.provider.getSelection();
      currentData = [];
      if(selectedIndices && selectedIndices.length > 0) {
        
        for(let i=0;i<selectedIndices.length;i++)
        {
          currentData.push(this.provider.data[selectedIndices[i]]);
        }   
      }
    } else if (chosenOptions.compareItemA === 'Stratification Groups')
    {

    }

    console.log('current data: ', currentData);
    const inputA = this.prepareInput(d3.select(this.node).select('select.itemControls.compareA').select('option:checked').datum());
    const inputB = this.prepareInput(d3.select(this.node).select('select.itemControls.compareB').select('option:checked').datum());
    
    console.log('Inputs to get set measures.', 'A', inputA, 'B', inputB);
    const setMeasures : MeasureMap = MethodManager.getSetMethods(inputA, inputB);
    console.log('set measures for current data', setMeasures);

    //this.updateTouringTables(setMeasures, descriptions, currentData);

    // div element in html where the score and detail view should be added
    let measuresDivElement = d3.select('div[class="measures"]');
    measuresDivElement.selectAll("*").remove(); //deletes all generated content im 'measuresDivElement'
    
    let defaultExpanded = true; //defines if the accordion item should be expanded at the beginning

    if(setMeasures)
    {
      console.log('set measures: ', setMeasures);
      
      //group panel (accordion) for all acordion items
      let accordionId = this.getIdWithTimestamp('accordion');
      let panelGroup = measuresDivElement.append('div')
                                          .attr('class','panel-group')
                                          .attr('id',accordionId);

      for(let [type, typeMeasures] of setMeasures) {
        // console.log('setMeasures current type: '+type);
        // console.log('setMeasures current #1 '+typeMeasures[0]);

        for(let i=0; i<typeMeasures.length; i++)
        {
        
          let collapseId = this.getIdWithTimestamp(typeMeasures[i].id);
          //console.log('accordion item/collapse id: ',collapseId);
          
          let collapseDetails = {
            groupId: accordionId,
            id: collapseId,
            label: typeMeasures[i].label,
            default: defaultExpanded
          };

          if(defaultExpanded) //after the first accordion was created -> the following ones should be collapsed
          {
            defaultExpanded = !defaultExpanded;
          }

          //create accordion item and add it to the panel group
          this.createAccordionItem(panelGroup,collapseDetails);

          //insert the calculated score (jaccard: table) into the before created accordion item
          this.insertMeasure(typeMeasures[i], collapseId, currentData)
        }
      }
    }
  }
    

 /*  private updateTouringTables(measures: MeasureMap, currentAttributes: IColumnDesc[], currentItems: Array<any>) {

    // Get the first measure for every comparison type
    const displayedMeasures = [];

    measures.forEach((typeMeasures, type) => {
      console.log('#1 '+ type.toString(), typeMeasures[0]);
      //displayedMeasures.push(typeMeasures[0]); //show highest ranked
      typeMeasures.forEach((m) => displayedMeasures.push(m)); //show all
    });

    // bind the measure to the div containers
    const containers = d3.select(this.node).select('.measures').selectAll('.measure').data(displayedMeasures, (m) => m.id); //measure id as key for the data

    // enter phase
    // Append div for each measure, containing headline, table, and visualization.
    const containers_enter = containers.enter().append('div').attr('class', 'measure');

    // Headline
    containers_enter.append('h4').text((m) => m.label);
    // Table
    containers_enter.append('table').attr('class', 'table-responsive')
                    .append('table').attr('class', 'table table-bordered table-condensed table-hover');

    // TODO add visualization


    // update phase ... entering elems implicitly included in d3 v3. (v4 needs merge)
    const containers_update = containers;

    //TODO update table content

    // exit phase
    containers.exit().remove();
  } */
    

  //generates id for the collapseable panel in the accordion with the measure type and the current time's minutes/seconds and millisec
  private getIdWithTimestamp(prefix: string)
  {
    let currdate = new Date();
    return prefix +  <string><any>currdate.getMinutes() + <string><any>currdate.getSeconds() + <string><any>currdate.getMilliseconds();
  }

  private createAccordionItem(panelGroup: any, collapseDetails: any)
  {
    if(collapseDetails && collapseDetails instanceof Object && 
      collapseDetails.groupId && typeof collapseDetails.groupId === 'string' &&
      collapseDetails.id && typeof collapseDetails.id === 'string' &&
      collapseDetails.label && typeof collapseDetails.label === 'string')
    {
      let panel = panelGroup.append('div')
                            .attr('class','panel');

      let panelHeading = panel.append('div')
                              .attr('class','panel-heading')
                              .attr('role','tab')
                                  .append('h4')
                                  .attr('class','panel-title')
                                  //multiple expanded accordions
                                  .html(`<a data-toggle="collapse" href="#${collapseDetails.id}">${collapseDetails.label}</a>`)
                                  //single expanded accordion
                                  //.html(`<a data-toggle="collapse" data-parent="#${collapseDetails.groupId}" href="#${collapseDetails.id}">${collapseDetails.label}</a>`)
 
      let panelCollapse = panel.append('div')
                              .attr('class','panel-collapse collapse')
                              .attr('id',collapseDetails.id);
      
      if(collapseDetails.default)
      {
        panelCollapse.classed('in',true); //accordion item is expanded
      }
      
      let panelBody = panelCollapse.append('div')
                                    .attr('class','panel-body');
                                  
    }
  }


  private insertMeasure(measure: ISImilarityMeasure, collapseId: string, currentData: Array<any>) {
    
    if(measure && measure.id === 'jaccard')
    {
     
      let buttonValue = this.getRadioButtonValue();
      this.generateJaccardTable(collapseId, currentData);
      //this.drawImage(collapseId);
    }else 
    {
      
      this.drawTable(collapseId);
     
    }
  }
    
  // return object with the current selected states of all the dropdowns and radio button
  private getChosenOptions()
  {
    let chosenOptions = {
      compareItemA: d3.select(this.node).select('select.itemControls.compareA').property("value"),
      compareItemB: d3.select(this.node).select('select.itemControls.compareB').property("value"),
      radioButton: this.getRadioButtonValue(),
      compareAttributeA: d3.select(this.node).select('select.attributeControls.compareA').property("value"),
      compareAttributeB: d3.select(this.node).select('select.attributeControls.compareB').property("value")
    };

    return chosenOptions;
  }

  // get all column of type 'categorical' with their categories
  private getAllCategoricalColumns()
  {
    let allCategorical = [];
    let referenceLabeles = [];
    let allColumns = this.provider.getRankings()[0].children;
    for(let i=0; i<allColumns.length; i++)
    {
      if(allColumns[i] && allColumns[i].getRenderer() === "categorical" && (<ICategoricalColumn>allColumns[i]).categories)
      {
        if(referenceLabeles.indexOf(allColumns[i].label) === -1)
        { 
          let currCol = {
            label: allColumns[i].label,
            column: (<IServerColumn>allColumns[i].desc).column, //TODO wozu brauchen wir das?
            categories: (<ICategoricalColumn>allColumns[i]).categories
            };
          allCategorical.push(currCol);
          referenceLabeles.push(allColumns[i].label);
        }
      }
    }
    // console.log('allColumns: ', allColumns);
    console.log('allCategorical: ', allCategorical);
    return allCategorical;

  }

  private generateJaccardTable(containerId: string, currentData: Array<any>)
  {
    let allCategoricalCol = this.getAllCategoricalColumns();
    let chosenOptions = this.getChosenOptions();
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
              .text(function(d) { return d.label; });

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
                      if(Number(d.value.label.toString())) {
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
                                        .style("font-weight", 'bolder');                                      ;
                        }
                      })					
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
    console.log('Cell Clicked');
    console.log('Cell: ',cell);

    let oldSvgContainer = d3.select('div[class="svg-container"]');
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
      let rowSelected = {};
      rowSelected[''+columnLabel] = (cell.value.selected[i].label as string);
      rowSelected['Selection'] = 'Selected';
      rowSelected['value'] = (cell.value.selected[i].amount as number);
      currData.push(rowSelected);

      //selected
      let rowUnselected = {};
      rowUnselected[''+columnLabel] = (cell.value.selected[i].label as string);
      rowUnselected['Selection'] = 'Unselected';
      rowUnselected['value'] = (cell.value.allData[i].amount as number)-(cell.value.selected[i].amount as number);
      currData.push(rowUnselected);

    }

    console.log('currentData',currData);

    // console.log('SVG Conatiner - width: ',width);
    let testData = [
      { 'A Cat1': 'Cat1', Selection: 'Selected'},
      { 'A Cat1': 'Cat1', Selection: 'Selected'},
      { 'A Cat1': 'Cat1', Selection: 'Unselected'},
      { 'A Cat1': 'Cat2', Selection: 'Unselected'},
      { 'A Cat1': 'Cat2', Selection: 'Unselected'},
      { 'A Cat1': 'Cat2', Selection: 'Selected'},
      { 'A Cat1': 'Cat2', Selection: 'Unselected'},
      { 'A Cat1': 'Cat3', Selection: 'Unselected'},
      { 'A Cat1': 'Cat3', Selection: 'Selected'},
      { 'A Cat1': 'Cat3', Selection: 'Selected'},
    ];

    let testDataCompact = [
      { 'A Cat1': 'Cat1', Selection: 'Selected', value: 12},
      { 'A Cat1': 'Cat1', Selection: 'Unselected', value: 1},
      { 'A Cat1': 'Cat2', Selection: 'Selected', value: 1},
      { 'A Cat1': 'Cat2', Selection: 'Unselected', value: 3},
      { 'A Cat1': 'Cat3', Selection: 'Selected', value: 2},
      { 'A Cat1': 'Cat3', Selection: 'Unselected', value: 33},
    ];

    let chart = (<any>d3).parsets()
                        .tension(0.5) //[0 .. 1] -> 1 = straight line 
                        .dimensions([columnLabel, 'Selection'])
                        .value( function (d) { return d.value; })
                        .width(width)
                        .height(175);

    let svgCanvas = svgContainer.append('svg')
                                .attr('width',chart.width())
                                .attr('height',chart.height());
                                // .attr('width','100%')
                                // .attr('height','100%');

    let svgFigureGroup = svgCanvas.append('g');

    // draw parallel sets
    svgFigureGroup.datum(currData).call(chart);
    

    // let svgDimensions = svgFigureGroup.selectAll('g[class=dimension]')[1];
    // console.log('svgDimensions',svgDimensions);


  }



  // calculated jaccard score
  private calculateJaccardScores(currentItems: Array<any>)
  {
    let allData = this.provider.data;
    let allCategoricalCol = this.getAllCategoricalColumns();
    let chosenOptions = this.getChosenOptions();
    
    let chosenColumns = [];

    if(chosenOptions.compareItemB === "All categorical columns")
    {
      chosenColumns = allCategoricalCol;

    } else if(chosenOptions.compareItemB === "Selection")
    {
      chosenColumns = allCategoricalCol;

    } else 
    {
      let colIndex = allCategoricalCol.map((a) => a.label).indexOf(chosenOptions.compareItemB);
      chosenColumns.push(allCategoricalCol[colIndex]);
    }

    console.log('allCategoricalCol: ', allCategoricalCol);
    
    console.log('chosenColumns: ', chosenColumns);
    console.log('chosenColumns d3: ', this.prepareInput(d3.select(this.node).select('select.itemControls.compareB').select('option:checked').datum()));
    // chosenColumns = this.prepareInput(d3.select(this.node).select('select.itemControls.compareB').select('option:checked').datum());

    let jaccardScores = [];


    for(let i=0; i<chosenColumns.length; i++)
    {
      let currCol = chosenColumns[i];
      
      for(let cnt=0; cnt < currCol.categories.length; cnt++)
      {
        let currCategory = currCol.categories[cnt];
        let scoreSelected = this.getElementsByPropertyValue(currentItems,currCol.column,currCategory.label).length / 
                            this.getElementsByPropertyValue(allData,currCol.column,currCategory.label).length;
        scoreSelected = Math.round(scoreSelected*1000)/1000;

        // let scoreDeselected = (this.getElementsByPropertyValue(allData,currCol.column,currCategory.label).length - 
        //                             this.getElementsByPropertyValue(currentItems,currCol.column,currCategory.label).length) / 
        //                       this.getElementsByPropertyValue(allData,currCol.column,currCategory.label).length;    
        // scoreDeselected = Math.round(scoreDeselected*1000)/1000;

        let scoreDeselected = 1 - scoreSelected;
        scoreDeselected = Math.round(scoreDeselected*1000)/1000;

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
            allData: this.getCategoryPartioning(allData,currCol),
            selected: this.getCategoryPartioning(currentItems,currCol)
          },
          col4: {
            label: scoreDeselected,
            column: currCol.column,
            column_label: currCol.label,
            category: currCategory.label,
            color: this.score2color(scoreDeselected),
            action: true,
            allData: this.getCategoryPartioning(allData,currCol),
            selected: this.getCategoryPartioning(currentItems,currCol)
          }
        };


        jaccardScores.push(resultObj);
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
      let num = this.getElementsByPropertyValue(data,column.column,currCategory.label).length;
      num = (num === undefined  || num === null) ? 0 : num;
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
    const linScale = d3.scale.linear().domain(domain).range([255, 110]);
    const brightness = linScale(score);
    const hslColor =  d3.rgb(brightness, brightness, brightness);
    return hslColor.toString();
  }
  
  private getElementsByPropertyValue(elements: Array<any>, property: string, value: string | number)
  {
    return elements.filter(row => row[property] === value);
  }

  

  /* https://stackoverflow.com/questions/32999179/d3-table-with-rowspan
  nested_data.forEach(function (d) {
    var rowspan = d.values.length;
    d.values.forEach(function (val, index) {
        var tr = thead.append("tr");
        if (index == 0) { //rowspan only for first element
            tr.append("td")
                .attr("rowspan", rowspan)
                .text(val.Year);
        }
        tr.append("td")
            .text(val.Month);
        tr.append("td")
            .text(val.Team);
        tr.append("td")
            .text(val.Sales);

    });
}); */



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


  private drawImage(containerId: string) {
    let svgContainer = d3.select('#'+containerId).append('div')
                                                .attr('class','svg-container');

    /* let svgCanvas = svgContainer.append('svg')
                                .attr('width','100%')
                                .attr('height','100%')
                                .attr('shape-rendering','optimizeQuality');

     let lineFunction = d3.svg.line()
                            .x(function(d) { return d['x']; })
                            .y(function(d) { return d['y']; })
                            .interpolate("linear");

    let rectangle1 = svgCanvas.append("rect")
                             .attr("x", 10)
                             .attr("y", 10)
                             .attr("rx", 5)
                             .attr("ry", 5)
                             .attr("width", 40)
                             .attr("height", 40)
                             .attr("fill", "dodgerblue")
                             .attr("opacity", 0.5);

    let text1 = svgCanvas.append("text")
                        .attr("x", 30)
                        .attr("y", 34)
                        .attr("text-anchor","middle")
                        .text("a");

    let lineSet1 = [{'x': 45, 'y': 10}, {'x': 115, 'y': 10}];
    let lineSet2 = [{ "x": 45,  "y": 50}, { "x": 115,  "y": 50}];

    var line1 = svgCanvas.append("path")
                            .attr("d", lineFunction(lineSet1))
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .attr("fill", "none");
    
    var line1 = svgCanvas.append("path")
                            .attr("d", lineFunction(lineSet2))
                            .attr("stroke", "black")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

    let rectangle2 = svgCanvas.append("rect")
                            .attr("x", 10)
                            .attr("y", 60)
                            .attr("rx", 5)
                            .attr("ry", 5)
                            .attr("width", 40)
                            .attr("height", 50)
                            .attr("fill", "blueviolet")
                            .attr("opacity", 0.5);

    let text2 = svgCanvas.append("text")
                        .attr("x", 30)
                        .attr("y", 89)
                        .attr("text-anchor","middle")
                        .text("b");

    let lineSet3 = [{'x': 45, 'y': 60}, {'x': 115, 'y': 80}];
    let lineSet4 = [{ "x": 45,  "y": 110}, { "x": 110,  "y": 115}];

    var line3 = svgCanvas.append("path")
                            .attr("d", lineFunction(lineSet3))
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .attr("fill", "none");
    
    var line4 = svgCanvas.append("path")
                            .attr("d", lineFunction(lineSet4))
                            .attr("stroke", "black")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

    let rectangle3 = svgCanvas.append("rect")
                            .attr("x", 10)
                            .attr("y", 120)
                            .attr("rx", 5)
                            .attr("ry", 5)
                            .attr("width", 40)
                            .attr("height", 25)
                            .attr("fill", "green")
                            .attr("opacity", 0.5);

    let text3 = svgCanvas.append("text")
                        .attr("x", 30)
                        .attr("y", 136)
                        .attr("text-anchor","middle")
                        .text("c");

    let lineSet5 = [{'x': 45, 'y': 120}, {'x': 110, 'y': 115}];
    let lineSet6 = [{ "x": 45,  "y": 145}, { "x": 115,  "y": 145}];

    var line5 = svgCanvas.append("path")
                            .attr("d", lineFunction(lineSet5))
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .attr("fill", "none");
    
    var line6 = svgCanvas.append("path")
                            .attr("d", lineFunction(lineSet6))
                            .attr("stroke", "black")
                            .attr("stroke-width", 2)
                            .attr("fill", "none");

    let rectangle4 = svgCanvas.append("rect")
                        .attr("x", 110)
                        .attr("y", 10)
                        .attr("rx", 5)
                        .attr("ry", 5)
                        .attr("width", 40)
                        .attr("height", 40)
                        .attr("fill", "dodgerblue")
                        .attr("opacity", 0.5);

    let text4 = svgCanvas.append("text")
                      .attr("x", 130)
                      .attr("y", 34)
                      .attr("text-anchor","middle")
                      .text("a");

    let rectangle5 = svgCanvas.append("rect")
                          .attr("x", 110)
                          .attr("y", 80)
                          .attr("rx", 5)
                          .attr("ry", 5)
                          .attr("width", 40)
                          .attr("height", 65)
                          .attr("fill", "grey")
                          .attr("opacity", 0.5);

    let text5 = svgCanvas.append("text")
                      .attr("x", 130)
                      .attr("y", 116)
                      .attr("text-anchor","middle")
                      .text("others"); */

  }
  
  private getSelectionDesc() : ICategoricalColumnDesc {
    const selCategories = new Array<string>();
    const numberOfRows = this.provider.getRankings()[0].getGroups().map((group) => group.order.length).reduce((prev, curr) => prev + curr); // get length of stratification groups and sum them up
    if (this.provider.getSelection().length > 0) {
      selCategories.push('Selected');
    } // else: none selected

    if (this.provider.getSelection().length < numberOfRows) {
      selCategories.push('Unselected')
    } // else: all selected
    
    return {
      categories: selCategories,
      label: 'Selection',
      type: 'categorical',
      missingCategory: null
    };
  }


  private updateDropdowns() {
    console.log('changed dropdown value. A:', d3.selectAll('select.itemControls').property("value"), '\t|B: ', d3.selectAll('select.itemControls.compareB').property("value"));
  
    const dropdownA = d3.select(this.node).select('select.itemControls.compareA');
    // dropdownA ('With')
    // We append the current data to:
    //  the entry for the selection       (defined in the html)
    //  the entry for the stratification  (defined in the html)

    // Generate a Attribute description that represents the current selection
    const selDesc = this.getSelectionDesc();
    const selOption = dropdownA.select('option.selection').datum(selDesc); //bind description to option and set text
    selOption.text((desc) => desc.label);

    
    // Generate an attribute description that represents the current stratification
    const stratDesc: ICategoricalColumnDesc = {
      categories: this.provider.getRankings()[0].getGroups().map((group) => group.name), // if not stratifified, there is only one group ('Default')
      label: 'Stratification Groups',
      type: 'categorical',
      missingCategory: null
    }
    dropdownA.select('option.stratification').datum(stratDesc).text((desc) => desc.label); //bind description to option and set text

    

    const dropdownB = d3.select(this.node).select('select.itemControls.compareB');
    const mode = this.getRadioButtonValue();
    let descriptions: IColumnDesc[] = this.provider.getRankings()[0].children.map((col) => col.desc);
    if (mode === 'category') {
      // If Categories is selected:
      //    we generate an entry for every categorical attribute
      //    and an entry representing the selected/unselected items as a attribute with two categories
      //    and an entry representing all these attributes
      descriptions = descriptions.filter((desc) => (<ICategoricalColumnDesc>desc).categories);
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
        (<ICategoricalColumnDesc>desc).categories = stratDesc.categories; // Replace real categopries with those from stratification
        (<ICategoricalColumnDesc>desc).missingCategory = null;
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
    this.updateTouringData();
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


  private getDropdownELementbyClassName(classNmame: string)
  {
    //gets all elements with the 'itemControls' and 'compare B' classes
    let itemControls = this.node.getElementsByClassName(classNmame);
    //console.log('itemControls',itemControls);
    //check if only one elment exist and that it is a selection element
    if (itemControls && itemControls.length === 1 && (itemControls[0] instanceof HTMLSelectElement))
    {
      return itemControls[0];
    }

    return null;
  }
  
  private getRadioButtonValue()
  {
    return d3.select(this.node).select('input[name="compareGroup"]:checked').property('value');
  }
}

