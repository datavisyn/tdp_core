import {ICategoricalColumnDesc,ICategoricalColumn, SidePanel, spaceFillingRule, IGroupSearchItem, exportRanking, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc, isCategoricalColumn} from 'lineupjs';
import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, Type, ISImilarityMeasure, MeasureMap} from 'touring';
import * as d3 from 'd3'
import { DummyDataType, defineDataType } from '../../../../node_modules/phovea_core/src/datatype';


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
      
      
      console.log('provider',this.provider);
      //console.log('provider.getSelection: ',this.provider.getSelection());
      console.log('provider.getSelection: ',this.provider.getSelection());
      //console.log('provider.selectedRows: ',this.provider.selectedRows());
      //console.log('provider.getColumns: ',this.provider.getColumns());
      console.log('provider.getRanking: ',this.provider.getRankings());
      console.log('provider.getRankings()[0].children: ',this.provider.getRankings()[0].children);
      //console.log('provider.getFilter: ',this.provider.getFilter());
      //console.log('------------------------------------');

    }));


  


    this.addEventListeners();
  }

  private addEventListeners() {
    // HTML ELEMENT LISTENERS
    // -----------------------------------------------

    // changes of radio button selection
    d3.select(this.node).selectAll('input[name="compareGroup"]').on('change', () => {  
      // using fat arrow: global scope replaces new object's scope and 'this' can be used to call class functions
      const radio = d3.select(this.node).select('input[name="compareGroup"]:checked')
      console.log('radio button value: ',radio.property('value'), ' | object: ', radio);

      this.updateDropdowns();
    });

    //changes made in dropdowns
    d3.select(this.node).selectAll('select.itemControls').on('input',() => {
      console.log('changed dropdown value: ', d3.selectAll('select.itemControls').property("value"));
      this.updateTouringData();
    });



    // DATA CHANGE LISTENERS
    // -----------------------------------------------
    // change in selection 
    this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED+TouringLineUpPanel.EVENTTYPE, (indices) => {
      console.log('selection changed, indices: ', indices);
      this.updateTouringData();
    });

    //column of a table was added
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN+TouringLineUpPanel.EVENTTYPE, (col, i) => {
      //console.log('event added column', col, 'index', i)
      if(col.desc && (col.desc.type === 'categorical' || col.desc.type === 'number' || col.desc.type === 'string')) {
        this.updateDropdowns('add',col.desc);
        //this.addOptionToDropdown(dropdownItemCopareA,col.desc);
      }
    });

    //column of a table was removed
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN+TouringLineUpPanel.EVENTTYPE, (col, i) => {
      //console.log('event removed column', col, 'index', i)
      if(col.desc && (col.desc.type === 'categorical' || col.desc.type === 'number' || col.desc.type === 'string')) {
        this.updateDropdowns('remove',col.desc);
        //this.removeOptionFromDropdown(dropdownItemCopareA,col.desc);
      }
    });
  }
    
  
  private updateTouringData() 
  {
    //console.log('update touring data');

    // ---- selection
    let selectedIndices = this.provider.getSelection();
    let currentData = [];
    if(selectedIndices && selectedIndices.length > 0) {
      
      for(let i=0;i<selectedIndices.length;i++)
      {
        currentData.push(this.provider.data[selectedIndices[i]]);
      }
      
    }else {
      currentData = this.provider.data;
    }

    console.log('current data length: ', currentData);

    const descriptions = this.provider.getRankings()[0].children.map((col) => col.desc);
    const setMeasures = MethodManager.getSetMethods([{label: 'Selection', type: Type.CATEGORICAL}], descriptions);
    console.log('set measures for current data', setMeasures);

    //this.updateTouringTables(setMeasures, descriptions, currentData);

    // div element in html where the score and detail view should be added
    let measuresDivElement = d3.select('div[class="measures"]');
    measuresDivElement.selectAll("*").remove();

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
            label: typeMeasures[i].label
          };

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
                              .attr('id',collapseDetails.id)
                                  .append('div')
                                  .attr('class','panel-body');
      
    }
  }

  private insertMeasure(measure: ISImilarityMeasure, collapseId: string, currentData: Array<any>) {
    
    //console.log('measure ' ,measure);
    if(measure && measure.id === 'jaccard')
    {
      this.generateJaccardTable(collapseId, currentData);
      //this.drawImage(collapseId);
    }else 
    {
      
      this.drawTable(collapseId);
     
    }
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
            column: allColumns[i].desc.column,
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
    let tableContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','table-container');


    let allCategorical = this.getAllCategoricalColumns();
    // let currentData = [
    //   { a_cat1: "ACat 1" , a_cat2: "ACatB 1" , a_int: 87 , a_name: "A11" , a_real: -0.8596081557 , id: "11"},
    //   { a_cat1: "ACat 1" , a_cat2: "ACatB 3" , a_int: 11 , a_name: "A13" , a_real: -0.1981791449 , id: "13"},
    //   { a_cat1: "ACat 1" , a_cat2: "ACatB 5" , a_int: 97 , a_name: "A18" , a_real: 0.8045080081 , id: "18"},
    //   { a_cat1: "ACat 1" , a_cat2: "ACatB 3" , a_int: 8 , a_name: "A23" , a_real: -0.0165625107 , id: "23"},
    //   { a_cat1: "ACat 1" , a_cat2: "ACatB 1" , a_int: 32 , a_name: "A29" , a_real: 0.4855202222 , id: "29"}
    // ];
    let jaccardScores = this.calculateJaccardScores(currentData);
    console.log('jaccardScores: ', jaccardScores);


    //let columnHeaders = ['col1','col2','col3','col4'];
    let columnHeaders = [
      { head: 'col1', label: ''},
      { head: 'col2', label: ''},
      { head: 'col3', label: 'Selected'},
      { head: 'col4', label: 'Unselected'},
    ];


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
     // create a row for each object in the data
    var rows = tableBody.selectAll('tr')
                      .data(jaccardScores)
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
                          return {value: row[column.head]};
                      });
                    })
                    .enter()
                    .append('td')
                    .attr('class','text-center')
                    .text(function(d) { return d.value; });
  }


  // calculated jaccard score
  private calculateJaccardScores(currentItems: Array<any>)
  {
    let allData = this.provider.data;
    let allCategoricalCol = this.getAllCategoricalColumns();

    let jaccardScores = [];

    for(let i=0; i<allCategoricalCol.length; i++)
    {
      let currCol = allCategoricalCol[i];
      
      for(let cnt=0; cnt < currCol.categories.length; cnt++)
      {
        let currCategory = currCol.categories[cnt];
        let scoreSelected = this.getElementsByPropertyValue(currentItems,currCol.column,currCategory.label).length / 
                            this.getElementsByPropertyValue(allData,currCol.column,currCategory.label).length;
        scoreSelected = Math.round(scoreSelected*1000)/1000;

        let scoreDeselected = (this.getElementsByPropertyValue(allData,currCol.column,currCategory.label).length - 
                                    this.getElementsByPropertyValue(currentItems,currCol.column,currCategory.label).length) / 
                              this.getElementsByPropertyValue(allData,currCol.column,currCategory.label).length;    
        scoreDeselected = Math.round(scoreDeselected*1000)/1000;

        let resultObj = {
          col1: currCol.label,
          col2: currCategory.label,
          col3: scoreSelected,
          col4: scoreDeselected
        };

        jaccardScores.push(resultObj);
      }

    }

    return jaccardScores;
    
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
  
  /**
   * Gets the currently displayed attributes in Lineup and updates the dropdowns and table accordingly
   */
  private update() {
    this.updateDropdowns();

  }
  
  /**
   * If 
   */
  private updateDropdowns(mode?: string, option?: any) 
  {
    //console.log('update Dropdown, mode: ',mode, ' | option: ',option);
    let dropdownItemCopareA = <HTMLSelectElement>this.getDropdownELementbyClassName('itemControls compareA');
    let dropdownItemCopareB = <HTMLSelectElement>this.getDropdownELementbyClassName('itemControls compareB');
    let dropdownAttributeCompareA = <HTMLSelectElement>this.getDropdownELementbyClassName('attributeControls compareA');
    let dropdownAttributeCompareB = <HTMLSelectElement>this.getDropdownELementbyClassName('attributeControls compareB');

    //Compare A: depending on displayed attributes
    if(dropdownItemCopareB && mode !== undefined && option)
    {
      if(mode === 'add'){

        this.addOptionToDropdown(dropdownAttributeCompareA,option);
        this.addOptionToDropdown(dropdownAttributeCompareB,option);

        if(option.type === 'categorical')
        {
          this.addOptionToDropdown(dropdownItemCopareB,option);
        }

      }else if(mode === 'remove'){

        this.removeOptionFromDropdown(dropdownAttributeCompareA,option);
        this.removeOptionFromDropdown(dropdownAttributeCompareB,option);

        if(option.type === 'categorical')
        {
          this.removeOptionFromDropdown(dropdownItemCopareB,option);
        }

      }
    }

    //Compare B: depending on radio button option
    if(dropdownItemCopareB){
      let buttonValue = this.getRadioButtonValue('form-check-input itemControls');
      this.updateDropdownDependingOnRadioButton(dropdownItemCopareB,buttonValue);
    }

    //changing the radio button or the removing columns could create a different selection in the dropdowns
    //therefore the touring data will be updated
    this.updateTouringData();

  }


  private getRadioButtonValue(className: string)
  {
    let buttonValue = null;
    let radioButtons = this.node.getElementsByClassName(className);

    if(radioButtons)
    {
      for(let i=0;i<radioButtons.length;i++)
      {
        let currButton =  (radioButtons[i] instanceof HTMLInputElement) ? <HTMLInputElement>radioButtons[i] : null;
        if(currButton && currButton.checked)
        {
          buttonValue = currButton.value;
        }
      }
    }

    return buttonValue;
  }



  //add option to dropdown
  private addOptionToDropdown(dropdown: HTMLSelectElement, option: any)
  {
    //console.log('add | option:', option, ' | to dropdown:', dropdown);

    if (dropdown && option && option instanceof Object && option.label)
    {
      //check if the current column option is already in the dropdown options
      if(!(this.checkOptionOccurranceInDropdown(dropdown,option).exists))
      {
        let htmlOptionElement = document.createElement('option');
        //htmlOptionElement.value = option.value;
        htmlOptionElement.text = option.label;

        //add the new option element to the HTMLSelectElement
        if (option.before){
          //when property 'before' exits the element will be added at the specified location
          dropdown.add(htmlOptionElement,option.before);
        }else {
          dropdown.add(htmlOptionElement);
        }
        //console.log('option elements was added');
        
      }
    }

  }

  //remove option from dropdown
  private removeOptionFromDropdown(dropdown: HTMLSelectElement, option: any)
  {
    //console.log('remove | option:', option, ' | from dropdown:', dropdown);

    if (dropdown && option && option instanceof Object && option.label)
    {
      //check if ther is still a column from the same label displayed
      if(!(this.checkColumnOccurance(option.label).exists))
      {
        let optionOccurance = this.checkOptionOccurranceInDropdown(dropdown,option);
        if(optionOccurance && optionOccurance.exists && optionOccurance.idx.length === 1)
        {
          dropdown.remove(optionOccurance.idx[0]);

          //console.log('option element was removed');
        }
      }
    }

  }

  //check before method if the two parameter 'dropdown' and 'option' are valid
  private checkOptionOccurranceInDropdown(dropdown: HTMLSelectElement, option: any)
  {
    let optionOccurrance = 
    {
      exists: false,
      idx: []
    };

    for(let i = 0; i<dropdown.length;i++)
    {
      if(dropdown[i].text === option.label)
      {
        optionOccurrance.exists = true;
        optionOccurrance.idx.push(i);
      }
    }

    //console.log('option occurrence in dropbox: ',optionOccurrance);
    return optionOccurrance;
  }

  //check before method if the two parameter 'dropdown' and 'option' are valid
  private checkColumnOccurance(label: string)
  {
    let columns = this.provider.getRankings()[0].children.map(a => a.desc);
    let columnOccurrance = 
    {
      exists: false,
      idx: []
    };

    for(let i = 0; i<columns.length;i++)
    {
      if(columns[i].label === label)
      {
        columnOccurrance.exists = true;
        columnOccurrance.idx.push(i);
      }
    }

    //console.log('column occurrence in dropbox: ',columnOccurrance);
    return columnOccurrance;
  }



  
  private updateDropdownDependingOnRadioButton(dropdown: HTMLSelectElement, radioButtonValue: string) {
    if(radioButtonValue === 'category')
    {
      // console.log('remove extra options for stratification');
      // console.log('stratification: ',this.extraStartificationOptions);
      for(let i=0;i<this.extraStartificationOptions.length;i++)
      {
        this.removeOptionFromDropdown(dropdown,this.extraStartificationOptions[i]);
      }
      
    }else if (radioButtonValue === 'group')
    {
      // console.log('add extra options for stratification');
      // console.log('stratification: ',this.extraStartificationOptions);
      for(let i=0;i<this.extraStartificationOptions.length;i++)
      {
        this.addOptionToDropdown(dropdown,this.extraStartificationOptions[i]);
      }
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

}

