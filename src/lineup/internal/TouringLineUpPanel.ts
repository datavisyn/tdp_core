import {ICategoricalColumnDesc,ICategoricalColumn, SidePanel, spaceFillingRule, IGroupSearchItem, exportRanking, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, isCategoricalColumn, ICategory} from 'lineupjs';
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

  private feelsLikeTheVeryFirstTime = true;
  

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
      
      console.log('provider',this.provider);
      console.log('provider.getSelection: ',this.provider.getSelection(), ' of ', this.provider.getTotalNumberOfRows());
      console.log('provider.selectedRows: ',this.provider.selectedRows());
      console.log('provider.getColumns: ',this.provider.getColumns());
      // console.log('provider.getRanking: ',this.provider.getRankings());
      // console.log('getGroups', this.provider.getRankings()[0].getGroups())
      console.log('provider.getRankings()[0].children: ',this.provider.getRankings()[0].children);
      // console.log('provider.getFilter: ',this.provider.getFilter()); //TODO use filter
      // console.log('data', this.provider.data)
      // console.log('------------------------------------');

      var chart = (<any>d3).parsets()
      .dimensions(["Survived", "Sex", "Age", "Class"])
      .width(320)
      .height(200);

      var vis = d3.select("#vis").append("svg")
        .attr("width", chart.width())
        .attr("height", chart.height());

      d3.csv(titanic, function(error, csv) {
        vis.datum(csv).call(chart);
      });
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
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED+TouringLineUpPanel.EVENTTYPE, () => this.updateDropdowns()); //fat arrow to preserve scope in called function (this)

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

    return d3.select(this.node).select('select.itemControls.compareB').selectAll('option').data().filter((desc) => filter.includes(desc.type));;
  }
  
  private updateTouringData() {
    console.log('EVENT update touring data');

    let chosenOptions = this.getChosenOptions();
    //console.log('chosenOptions',chosenOptions);
    let currentData = [];

    // get currently displayed data
    this.provider.getRankings()[0].getGroups().forEach((stratGroup) => {
      stratGroup.order.forEach((rowId) => {
        
        // and include selection data
        const row = this.provider.data[rowId];
        row.selection = this.provider.getSelection().includes(rowId) ? 'Selected' : 'Unselected';
        currentData.push(row);
        });
    })

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
    
    /* nested_data.forEach(function (d) {
      var rowspan = d.values.length;
      d.values.forEach(function (val, index) {
          var tr = tableBody.append("tr");
          if (index == 0) {
              tr.append("td")
                  .attr("rowspan", rowspan)
                  .attr('class','text-center')
                  .text(val.col1);
          }
          tr.append("td")
              .attr('class','text-center')
              .text(val.col2);
          tr.append("td")
              .attr('class','text-center')
              .text(val.col3);
          tr.append("td")
              .attr('class','text-center')
              .text(val.col4);

          // Add a click handler that will return the datum instead of undefined
          tr.on('click', function(row) {
            console.log('Row Clicked');
            console.log(row);
          });    
  
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
                    .style("background-color", function(d){
                      return d.value.color || '#ffffff';
                     });
                    // .each(function (d, i) {
                    //     if (d.value.rowspan) {
                    //       // put all your operations on the second element, e.g.
                    //       if(d.value.rowspan > 0) {
                    //         d3.select(this).attr("rowspan", d.value.rowspan);
                    //       }
                    //     } 
                    //   });

    
    const that = this;
    cells.on('click', function(cell) {
      that.showVisualRepresentation(cell);
    });                  

  }

  private showVisualRepresentation(cell: any)
  {
    console.log('Cell Clicked');
    console.log('Cell: ',cell);
  }
  
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
    
    console.log('score', score);

    return score || 0;
  }

  // calculated jaccard score
  private calculateJaccardScores(currentItems: Array<any>)
  {
    const chosenColumns = this.prepareInput(d3.select(this.node).select('select.itemControls.compareB').select('option:checked').datum());
    console.log('chosenColumns d3: ', this.prepareInput(d3.select(this.node).select('select.itemControls.compareB').select('option:checked').datum()));

    let jaccardScores = [];

    for(let i=0; i<chosenColumns.length; i++)
    {
      let currCol = chosenColumns[i];
      
      for(let cnt=0; cnt < currCol.categories.length; cnt++)
      {
        let currCategory = currCol.categories[cnt];
        const scoreSelected = this.calcJaccard(currentItems, 'selection', 'Selected', currCol.column, currCategory.label);
        const scoreDeselected = this.calcJaccard(currentItems, 'selection', 'Unselected', currCol.column, currCategory.label);

        let resultObj = {
          col1: {
            label: currCol.label,
            rowspan: (cnt === 0) ? currCol.categories.length : 1                 
          },
          col2: {
            label: currCategory.label,
            color: currCategory.color
          },
          col3: {
            label: scoreSelected,
            column: currCol.column,
            category: currCategory.label,
            color: this.score2color(scoreSelected)
          },
          col4: {
            label: scoreDeselected,
            column: currCol.column,
            category: currCategory.label,
            color: this.score2color(scoreDeselected)
          }
        };


        jaccardScores.push(resultObj);
      }
    }

    return jaccardScores;
  }

  private score2color(score:number, domain = [0, 1])
  {
    score = score || 0; // fix undefined or NaN

    const linScale = d3.scale.linear().domain(domain).range([255, 110]);
    const darkness = linScale(score); // higher score -> darker color
    const hslColor =  d3.rgb(darkness, darkness, darkness);
    return hslColor.toString();
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

  
  private getSelectionDesc() : any {
    const selCategories = new Array<ICategory>();
    const numberOfRows = this.provider.getRankings()[0].getGroups().map((group) => group.order.length).reduce((prev, curr) => prev + curr); // get length of stratification groups and sum them up
    console.log('Selected ', this.provider.getSelection().length , 'Total ', numberOfRows);
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


  private updateDropdowns() {
    console.log('EVENT changed dropdown value. A:', d3.selectAll('select.itemControls').property("value"), '\t|B: ', d3.selectAll('select.itemControls.compareB').property("value"));
  
    const dropdownA = d3.select(this.node).select('select.itemControls.compareA');
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
    const stratDesc = {
      categories: this.provider.getRankings()[0].getGroups().map(function(group) {
        return {
          name: group.name,
          label: group.name
          // TODO get colors of stratification
          }
      }), // if not stratifified, there is only one group ('Default')
      label: 'Stratification Groups',
      type: 'categorical',
      column: 'strat_groups'
    }
    dropdownA.select('option.stratification').datum(stratDesc).text((desc) => desc.label); //bind description to option and set text

    
    // TODO remove categories which are not displayed
    const dropdownB = d3.select(this.node).select('select.itemControls.compareB');
    const mode = this.getRadioButtonValue();
    let descriptions: IColumnDesc[] = this.provider.getRankings()[0].children.map((col) => col.desc);
    if (mode === 'category') {
      // If Categories is selected:
      //    we generate an entry for every categorical attribute
      //    and an entry representing the selected/unselected items as a attribute with two categories
      //    and an entry representing all these attributes
      descriptions = descriptions.filter((desc) => (<ICategoricalColumnDesc>desc).categories);
      descriptions.forEach((desc) => {
        (desc as any).categories = this.provider.getRankings()[0].children.filter((child) => child.label == desc.label)[0].categories;
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

      if (this.feelsLikeTheVeryFirstTime)
      {
        this.feelsLikeTheVeryFirstTime = false;
        this.updateDropdowns(); //Update because the selection from provenenace may not be up to date 
      }
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

