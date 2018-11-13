import {ICategoricalColumnDesc, ICategoricalColumn, LocalDataProvider, IColumnDesc, ICategory, CategoricalColumn, Column, Ranking, IDataRow, IStringMapColumnDesc} from 'lineupjs';
import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, ISimilarityMeasure, IMeasureResult, MeasureMap, intersection, Comparison, Type} from 'touring';
import * as d3 from 'd3';
import 'd3.parsets';
import 'd3-grubert-boxplot';
import {isProxyAccessor} from './utils';
import {categories} from 'lineupjs/src/model/annotations';

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
      //console.log('radio button value: ', radio.property('value'), ' | object: ', radio);
      this.updateItemTab()
    });

    // changes made in dropdowns
    //    cause changes the displayed table / scores 
    d3.select(this.node).selectAll('select').on('input', () => this.updateTouringPanel());


    const self = this;
    // tab changed
    d3.select(this.node).selectAll('ul.nav a').on('click', function () {
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
    if (!this.touringElem.hidden) {
      // NOTE: after clicking on a tab, the class is not immidiatly correct/updated.
      if (d3.select(this.itemTab).classed('active')) {
        console.log('item tab is active, update content...');
        this.updateItemTab();
      } else if (d3.select(this.attributeTab).classed('active')) {
        console.log('attribtue tab is active, update content...');
        this.updateAttributeTab();
      }
    } else {
      console.log('Touring Panel is hidden, skip update.');
    }
  }

  private async updateItemTab() {
    await setTimeout( () => this.updateItemControls(), 0);
    //changing the radio button or the removing columns could create a different selection in the dropdowns
    //therefore the touring data will be updated
    await setTimeout(() => this.updateItemScoresOld(), 0);
  }

  private updateItemScores() {
    const inputA = this.prepareInput(d3.select(this.itemTab).select('select.compareA'));
    const inputB = this.prepareInput(d3.select(this.itemTab).select('select.compareB'));

    const setMeasures: Map<Comparison, ISimilarityMeasure[]> = MethodManager.getSetMethods(inputA, inputB);
    // Map to Arrray
    // Each array item consists of comparison and and array of measures
    // type[1] = array of measures
    // type[1][0] = first measure of the array
    const filteredMeasures = [...setMeasures].map((type) => type[1][0]);

    // div element in html where the score and detail view should be added
    const panelGroup = d3.select(this.itemTab).select('.measures');

    if (filteredMeasures && filteredMeasures.length > 0) {
      panelGroup.selectAll(':scope > p').remove() // remove immidiate child paragraphs of panelGroup
      //group panel (accordion) for all acordion items
      const timeStamp = this.getIdWithTimestamp('');


      const panels = panelGroup.selectAll('div.panel').data(filteredMeasures, (measure: ISimilarityMeasure) => measure.id); // measure id is key
      // Enter
      const panelsEnter = panels.enter().append('div').classed('panel', true) //Create new panels

      const panelHeader = panelsEnter //create panel heading
        .append('div').classed('panel-heading', true).attr('role', 'tab')
        .append('h4').classed('panel-title', true)
        .append('a').attr('data-toggle', 'collapse').attr('href', (d) => `#attr-${d.id}-${timeStamp}`).attr('aria-expanded', false);

      const tablesEnter = panelsEnter //create panel content
        .append('div').attr('class', 'panel-collapse collapse in')
        .attr('id', (d) => `attr-${d.id}-${timeStamp}`)
        .append('div').attr('class', 'table-container')
        .append('table').attr('class', 'table table-condensed');
      const theadEnter = tablesEnter
        .append('thead').append('tr');
      theadEnter.append('th'); // Attribute Name
      theadEnter.append('th'); // Category Name
      tablesEnter
        .append('tbody');

      const classScope = this;
      panels.each(function(d, i) {
          classScope.updateItemTable.bind(classScope)(this); // class scope workaround so that we can pass 'this' event as parameter 
      })

      // Update
      panelHeader.text((d) => d.label);
     
      // Exit
      panels.exit().remove(); // exit: remove columns no longer displayed
      panels.order();
    } else {
      panelGroup.selectAll("*").remove(); // avada kedavra mud-panels!
      panelGroup.append('p').text('Sorry, there are no appropriate measures for the selected inputs.');
    }
  }

  private updateItemTable(panel) {
    const measure = d3.select(panel).datum();
    const inputA = this.prepareInput(d3.select(this.itemTab).select('select.compareA')).filter((desc) => desc.type == measure.type.typeA); // TODO this should be more flexible
    const inputB = this.prepareInput(d3.select(this.itemTab).select('select.compareB')).filter((desc) => desc.type == measure.type.typeB);

    const headCategories = [].concat(...inputA.map((col) => col.categories));
    const colHeads = d3.select(panel).select('thead tr').selectAll('th.head').data(headCategories, (d:any) => d.name); // name of the category is key (not the label)
    colHeads.enter().append('th').attr('class', 'head');

    function updateTableBody(bodyData: Array<Array<any>>) {
      console.log('body data', bodyData);
  
      const trs = d3.select(panel).select('tbody').selectAll('tr').data(bodyData, (d) => d[0]+'-'+d[1]);
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d); // remove 
      tds.enter().append('td');
      // Set colheads in thead 
      colHeads.text((d) => d.label);
      // set data in tbody
      tds.html((d) => d === null ? '<i class="fa fa-circle-o-notch fa-spin"></i>' : (Number(d) ? d.toFixed(2) : d));
  
      // Exit
      colHeads.exit().remove(); // remove attribute columns
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
    }
    
    this.getItemTableBody(inputA, inputB, measure, true).then(updateTableBody); // initialize
    this.getItemTableBody(inputA, inputB, measure, false).then(updateTableBody); // set values
  }
  
  

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  private async getItemTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], measure: ISimilarityMeasure, scaffold: boolean): Promise<Array<Array<any>>> {
    const data = new Array(attr2.reduce((sum, col) => sum += (col as ICategoricalColumnDesc).categories.length ,0)); // rows = number of categories
    for (let i of data.keys()) {
      data[i] = new Array(attr1.reduce((sum, col:any) => sum += col.categories.length ,0) + 2).fill(null) // containing n1+2 elements (headers + n1 vlaues)
    }

    let rowIndex = 0;
    for (let col of attr2) {
        for (let cat of (col as ICategoricalColumnDesc).categories) {
          data[rowIndex][0] = col.label;
          data[rowIndex][1] = (cat as ICategory).label;
          rowIndex++;
        }
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];

      let rowIndex = 0;
      for (let col2 of attr2) {
        const attr2data = this.ranking.getAttributeDataDisplayed((col2 as any).column) //minus one because the first column is headers
        for (let cat2 of (col2 as any).categories) {
          const cat2Data = attr2data.filter((val) => val===cat2.name);
          let colIndex = 2;
          attr1.forEach((col1:any, i) => {
            const attr1data = this.ranking.getAttributeDataDisplayed((col1 as any).column) //minus one because the first column is headers
            col1.categories.forEach((cat1, j) => {
              const cat1Data = attr1data.filter((val) => val===cat1.name);
              (function(row, col) {
                promises.push(measure.calc(cat1Data, cat2Data)
                  .then((score) => data[row][col] = score)  // TODO call updateTable here?
                  .catch((err) => data[row][col] = Number.NaN)
                );
              })(rowIndex, colIndex); // Closure to have the current rowIndex & colIndex inside the 'then' callback
              colIndex++;
            });
          });
          rowIndex++;
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
  }


  private updateItemScoresOld() {
    const currentData = this.ranking.getItemsDisplayed();
    // console.log('current data: ', currentData);
    const inputA = this.prepareInput(d3.select(this.itemTab).select('select.compareA'));
    const inputB = this.prepareInput(d3.select(this.itemTab).select('select.compareB'));

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


  private async updateAttributeTab() {
    console.log('Updating attribute tab.');
    await setTimeout(() => this.updateAttributeControls(), 0);
    await setTimeout(() => this.updateAttributeScores(), 0);
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

  private updateAttributeScores() {
    const inputA = this.prepareInput(d3.select(this.attributeTab).select('select.compareA'));
    const inputB = this.prepareInput(d3.select(this.attributeTab).select('select.compareB'));

    console.log('Inputs to get attr measures:');
    console.log('A: ', inputA);
    console.log('B: ', inputB);
    const measures: MeasureMap = MethodManager.getAttributeMethods(inputA, inputB);;
    console.log('Attribute measures for current data: ', measures);

    // div element in html where the score and detail view should be added
    const panelGroup = d3.select(this.attributeTab).select('.measures');

    if (measures && measures.size > 0) {
      panelGroup.selectAll(':scope > p').remove() // remove immidiate child paragraphs of panelGroup
      //group panel (accordion) for all acordion items
      const timeStamp = this.getIdWithTimestamp('');

      const panels = panelGroup.selectAll('div.panel').data(measures.get(Comparison.get(Type.CATEGORICAL, Type.CATEGORICAL)), (measure: ISimilarityMeasure) => measure.id); // measure id is key
      // Enter
      const panelsEnter = panels.enter().append('div').classed('panel', true) //Create new panels

      const panelHeader = panelsEnter //create panel heading
        .append('div').classed('panel-heading', true).attr('role', 'tab')
        .append('h4').classed('panel-title', true)
        .append('a').attr('data-toggle', 'collapse').attr('href', (d) => `#attr-${d.id}-${timeStamp}`).attr('aria-expanded', false);

      const tablesEnter = panelsEnter //create panel content
        .append('div').attr('class', 'panel-collapse collapse in')
        .attr('id', (d) => `attr-${d.id}-${timeStamp}`)
        .append('div').attr('class', 'table-container')
        .append('table').attr('class', 'table table-condensed');
      tablesEnter
        .append('thead').append('tr').append('th')
      tablesEnter
        .append('tbody');

      const classScope = this;
      panels.each(function(d, i) {
          classScope.updateAttrTable.bind(classScope)(this); // class scope workaround so that we can pass 'this' event as parameter 
      })

      // Update
      panelHeader.text((d) => d.label);
     
      // Exit
      panels.exit().remove(); // exit: remove columns no longer displayed
      panels.order();
    } else {
      panelGroup.selectAll("*").remove(); // avada kedavra mud-panels!
      panelGroup.append('p').text('Sorry, there are no appropriate measures for the selected inputs.');
    }
  }

  private updateAttrTable(panel) {
    const measure = d3.select(panel).datum();
    const inputA = this.prepareInput(d3.select(this.attributeTab).select('select.compareA')).filter((desc) => desc.type == measure.type.typeA); // TODO this should be more flexible
    const inputB = this.prepareInput(d3.select(this.attributeTab).select('select.compareB')).filter((desc) => desc.type == measure.type.typeB);

    const colHeads = d3.select(panel).select('thead tr').selectAll('th.head').data(inputA, (d) => d.column); // column is key
    colHeads.enter().append('th').attr('class', 'head');

    function updateTableBody(bodyData: Array<Array<any>>) {
      console.log('body data', bodyData);
  
      const trs = d3.select(panel).select('tbody').selectAll('tr').data(bodyData, (d) => d[0]);
      trs.enter().append('tr');
      const tds = trs.selectAll('td').data((d) => d); // remove 
      tds.enter().append('td');
      // Set colheads in thead 
      colHeads.text((d) => d.label);
      // set data in tbody
      tds.html((d) => d === null ? '<i class="fa fa-circle-o-notch fa-spin"></i>' : (Number(d) ? d.toFixed(2) : d));
  
      // Exit
      colHeads.exit().remove(); // remove attribute columns
      tds.exit().remove(); // remove cells of removed columns
      trs.exit().remove(); // remove attribute rows
    }
    
    this.getAttrTableBody(inputA, inputB, measure, true).then(updateTableBody); // initialize
    this.getAttrTableBody(inputA, inputB, measure, false).then(updateTableBody); // set values
  }

  /**
   * async: return promise
   * @param attr1 columns
   * @param arr2 rows
   * @param scaffold only create the matrix with row headers, but no value calculation
   */
  private async getAttrTableBody(attr1: IColumnDesc[], attr2: IColumnDesc[], measure: ISimilarityMeasure, scaffold: boolean): Promise<Array<Array<any>>> {
    const data = new Array(attr2.length); // n2 arrays (rows) 
    for (let i of data.keys()) {
      data[i] = new Array(attr1.length + 1).fill(null) // containing n1+1 elements (header + n1 vlaues)
      data[i][0] = attr2[i].label;
    }

    if (scaffold) {
      return data;
    } else {
      const promises = [];
      for (let [i, row] of data.entries()) {
        for (let j of row.keys()) {
          if (j > 0 && measure.type.compares(attr1[j - 1].type, attr2[i].type)) {
            if (j <= i+1) { // start at 
              const data1 = this.ranking.getAttributeDataDisplayed((attr1[j - 1] as any).column); //minus one because the first column is headers
              const data2 = this.ranking.getAttributeDataDisplayed((attr2[i] as any).column);
              promises.push(measure.calc(data1, data2)
                .then((score) => row[j] = score.scoreValue)  // TODO call updateTable here?
                .catch((err) => row[j] = Number.NaN)
              ); // if you 'await' here, the calculations are done sequentially, rather than parallel. so store the promises in an array
            } else {
              row[j] = '';
            }
          }
        }
      }

      await Promise.all(promises); //rather await all at once: https://developers.google.com/web/fundamentals/primers/async-functions#careful_avoid_going_too_sequential
      return data; // then return the data
    }
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

  private insertMeasure(measure: ISimilarityMeasure, collapseId: string, currentData: Array<any>) {
    this.generateMeasureTable(collapseId, measure , currentData);
  }

  // --------- DATA TABLE LAYOUT ---
  //generates a object, which contains the table head and table body
  private async generateTableLayout(data: Array<any>, measure: ISimilarityMeasure)
  {
    let generatedTable = {
      tableHead: [],
      tableBody: []
    };
    
    // TABLE HEADER
    generatedTable.tableHead = this.getTableHeader();

    // TABLE BODY 
    generatedTable.tableBody  = await this.getTableBody(generatedTable.tableHead, data, measure);

    
    // console.log('generateTableLayout: ',generatedTable);
    return generatedTable;
  }

  //generate table header depending on the dropdown A option
  private getTableHeader()
  {
    let tableHeaders = [];
    let optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;
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
          bgcolor: '#ffffff'
        };
        tableHeaders.push(tableHead);
      }
    }

    return tableHeaders;
  }

  //generate table body depending on table head and radio button option
  private async getTableBody(tableHeader: Array<any>, data: Array<any>, measure: ISimilarityMeasure)
  {
    // console.log('getTableBody',{tableHeader, measure, data});
    let tableBody = [];

    const chosenColumns = this.prepareInput(d3.select(this.itemTab).select('select.compareB'));
    // console.log('getTableBody - chosenColumns: ', chosenColumns);
      
    const groups = this.ranking.getGroupedData();
    
    console.groupCollapsed(`TableBody - ${measure.id}`);
    console.time(`time TableBody - ${measure.id}`);
    for (const currCol of chosenColumns) {
      let colCategories = new Set(); 
      const mode = this.getRadioButtonValue();
      if (mode === 'category') {
        // Non Stratification
        colCategories = this.ranking.getAttributeCategoriesDisplayed(currCol.column);
      } else {
        //with stratification:
        colCategories = new Set(this.ranking.getStratificationDesc().categories.map((cat) => cat.label));
      }

      // item.name is used because for the strand attribute label !== name, as for all the other attributes
      let currCatAfterFilter = currCol.categories.filter((item) => colCategories.has(item.name));
      // console.log('displayed Categories: ',{colCategories,currCatAfterFilter});
      
      //for (const category of currCatAfterFilter) {
      for (const [catIndex, category] of currCatAfterFilter.entries()) { // for...of because of the await below (doesn't work in foreach () =>  ...)
        let tableRow = {};
        // console.groupCollapsed(`VisualRep - col:${currCol.label}(cat:${currCategory.label})`);
        // console.time(`Time - VisualRep col:${currCol.label}(cat:${currCategory.label})`);
        let dataVisualRep = this.getDataVisualRepresentation(measure, data, groups, tableHeader, currCol, category);
        // console.timeEnd(`Time - VisualRep col:${currCol.label}(cat:${currCategory.label})`);
        // console.groupEnd();
        
        for(let col=0; col < tableHeader.length; col++)
        {
          let colName = ((tableHeader[col] as any).columnName as string);
          
          if(col === 0) //first column (categorical column)
          {
            tableRow[colName] = {
              label: currCol.label,
              rowspan: (catIndex === 0) ? currCatAfterFilter.length : 0              
            };

          }
          else if(col === 1)  //second column (categoroies of categircal column)
          {
            tableRow[colName] = {
              label: category.label,
              bgcolor: category.color
            };
            
          }else //all the other columns
          {
            // const headerLabel = ((tableHeader[col] as any).label as string);
            // console.groupCollapsed(`Score - col:${currCol.label}(cat:${currCategory.label}) | head:${headerLabel}`);
            // console.time(`Time - Score calculation col:${currCol.label}(cat:${currCategory.label}) | head:${headerLabel}`);
            const measureResult = await this.calcScore(data, groups, measure ,(tableHeader[col] as any).label, currCol.column, category.label);
            let score = measureResult.scoreValue;
            if(measure.type.typeA.value === 'number' || measure.type.typeB.value === 'number'){
              score = measureResult.pValue;
            }
            // console.timeEnd(`Time - Score calculation col:${currCol.label}(cat:${currCategory.label}) | head:${headerLabel}`);
            // console.groupEnd();
            tableRow[colName] = {
              label: score, 
              column: currCol.column,
              columnLabel: currCol.label,
              category: category.label,
              bgcolor: this.score2color(measure.id,score),
              action: true,
              tableColumn: (tableHeader[col] as any).label,
              dataVisRep: dataVisualRep,
              measureResult: measureResult
            };
          }
        }
        
        tableBody.push(tableRow);
        tableRow = {};
      }
    }
    
    console.timeEnd(`time TableBody - ${measure.id}`); 
    console.groupEnd();

    return tableBody;
  }

  // --------- TABLE GENERATION D3 ---
  // create table in container and depending on dataTable with D3
  private async generateMeasureTable(containerId: string, measure: ISimilarityMeasure, currentData: Array<any>)
  {
    const dataTable = await this.generateTableLayout(currentData, measure);
    const that = this;

    // create a <div> as table container with D3
    let tableContainer = d3.select('#'+containerId).append('div')
                                                  .attr('class','table-container');

    // table                                        
    let table = tableContainer.append('table')
                            .attr('class','table table-condensed tableHeaderRotated');
    
    // table header
    let tableHeader = table.append('thead');
    tableHeader.append('tr')
              .selectAll('th')
              .data(dataTable.tableHead as Array<any>)
              .enter()
              .append('th')
              .attr('class',(i) => i<2 ? 'rotate table-label' : 'rotate table-value')
              // .attr('class','rotate table-attribute-col') 
                .append('div')
                .classed('borderedCell',(d) => {return d.label!=="";})
                  .append('span')
                  .text(function(d) { return (d as any).label; });

    // table body
    let tableBody = table.append('tbody');

    // table rows -> create a row for each object in the data
    let rows = tableBody.selectAll('tr')
                      .data(dataTable.tableBody)
                      .enter()
                      .append('tr');


    // table cells
    this.generateMeasureTableCell(measure, containerId, rows, dataTable)      
    
  }

  // creates the table cell depending on their functionality
  private generateMeasureTableCell(measure: ISimilarityMeasure, containerId: string, rows: d3.Selection<any>, dataTable: any) {

    const typeCategorical = 'categorical';
    const typeNumber = 'number';
    const measureTypeA = measure.type.typeA.value;
    const measureTypeB = measure.type.typeB.value;

    if(measureTypeA === typeCategorical && measureTypeB === typeCategorical){
      // combination: categorical/categorical
      // scores: jaccars, overlap
      return this.generateGenericMeasureTableCell(containerId, rows, dataTable, this.generateVisualRepParallelSets);
    }else{
      // combination: number/categorica | categorical/number | number/number
      // score: student-test, wolcoxon rank-sum-test, mwu-test
      return this.generateGenericMeasureTableCell(containerId, rows, dataTable, this.generateVisulRepBoxPlot);
    }
  }


  // creates the generic table cell for the table (formatting, styling, action handling)
  private generateGenericMeasureTableCell(containerId: string, rows: d3.Selection<any>, dataTable: any, actionFunciton: Function) {
    const that = this;

    // create a cell in each row for each column
    // At this point, the rows have data associated.
    // So the data function accesses it.
    rows.selectAll('td')
      .data(function (row) {
        //get all properties defined in dataTable.tableHead as an array with the data from the rows
        let returnValues = dataTable.tableHead.map(function (column) {
          // return an object for the column of the data row
          return row[column.columnName];
        });
        // console.log('returnValues: ',returnValues);

        //push all desired column objects into this array
        let allDesiredReturnValues = returnValues.filter(function (cell) {
          // return true if rowspan is not defiend OR rowspan exist and is bigger than 0
          return (cell.rowspan === undefined) || (cell.rowspan && cell.rowspan > 0);
        });

        // console.log('allDesiredReturnValues: ',allDesiredReturnValues);
        return allDesiredReturnValues;
      })
      .enter()
      .append('td')
      .attr('class', (d: any) => d.action ? 'text-center align-middle action' : 'text-left align-middle table-label')
      .style("background-color", (d: any) => d.bgcolor || '#ffffff')
      .style("color", (d: any) => d3.hsl(d.bgcolor || '#ffffff').l > 0.5 ? 'black' : 'white') // scores > 0.875  have white text
      .attr("rowspan", (d: any) => d.rowspan || 1)
      .text(function (d: any) {
        if (d.label && Number(d.label.toString())) {
          return Number(d.label.toString()).toFixed(3);
        }
        return d.label;
      })
      .on('click', function (d: any) {
        if (d.action) {
          // remove gb highlighting from all the other tds
          d3.select(this.parentElement.parentElement).selectAll('td').classed('selectedCell', false);
          // add bg highlighting 
          d3.select(this).classed('selectedCell', true); 
          
          actionFunciton.bind(that)(containerId, d);  
        }
      });
  }
 
  // --------- SCORES ---
  // different kinds of score calculations
  private calcScore(data, groups: Array<any>, measure: ISimilarityMeasure, headerCategory: string, columnB: string, categoryB: string): IMeasureResult {
    // console.group('get Sets')
    // console.time(`time - get Sets ${measure.id}`);
    const dataSets = this.getSelectionAndCategorySets(data, groups, headerCategory, columnB, categoryB);
    // console.timeEnd(`time - get Sets ${measure.id}`);
    // console.groupEnd();
    const selectionSet = dataSets.selectionSet.map((item) => item[columnB]); //compare currently used attribute
    const categorySet = dataSets.categorySet.map((item) => item[columnB]);


    // console.log('selectionSet', selectionSet);
    // console.log('categorySet', categorySet);


    return measure.calc(selectionSet, categorySet);
  }

  // --------- VISUAL REPRESENTATION ---
  // creates parallel set visualisation (for jaccard, overlap)
  private generateVisualRepParallelSets(containerId: string, cell: any) {
    console.log('Cell clicken (ParSets): ', {containerId, cell});
    let optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;

    let oldSvgContainer = d3.select(this.itemTab).select('div[class="svg-container ' + containerId + '"]');
    oldSvgContainer.remove(); //deletes all generated content im 'measuresDivElement'

    // delete old tooltip
    let tooltipParSets = d3.select("body").selectAll("div.parsets.tooltip").remove();

    let miniVisualisation = d3.select('#' + containerId).append('div')
      .attr('class', 'svg-container ' + containerId);


    this.generateVisualDetails(miniVisualisation);

    let width = Number(miniVisualisation.style('width').slice(0, -2)); //-25 because the scroll bar (15px) on the left is dynamically added
    let svgWidth = width - 25;
    let svgHeight = 175;
    let svg2DimLabelHeight = 45;
    // console.log('svgContainer.style("width"): ',svgContainer.style('width'));
    // console.log('width: ',width);


    //dimensions for the parallel sets
    //added prefix of dimension, otherwise the parallel sets can't be drawn with the same dimension twice
    let dimension1 = cell.columnLabel+'\uFEFF'; //append ZERO WIDTH NO-BREAK SPACE 
    let dimension2 = (optionDDA === 'Selection') ? 'Selection' : 'Stratification Groups';

    let colPart = cell.dataVisRep;
    let parSetData = [];

    for (let i = 0; i < colPart.length; i++) {
      let headerPart = colPart[i].parts;
      let categoryLabel = colPart[i].categoryLabel;


      for (let p = 0; p < headerPart.length; p++) {
        if(cell.category === categoryLabel && cell.tableColumn === headerPart[p].label)
        {
          let pSDIntersection = {};
          pSDIntersection['value'] = headerPart[p].intersectionAmount;
          pSDIntersection[dimension1] = categoryLabel;
          pSDIntersection[dimension2] = headerPart[p].label;
          if((pSDIntersection as any).value > 0){
            parSetData.push(pSDIntersection);
          }

          let pSDCategoryOther = {};
          pSDCategoryOther['value'] = colPart[i].categoryAmount - headerPart[p].intersectionAmount;
          pSDCategoryOther[dimension1] = categoryLabel;
          pSDCategoryOther[dimension2] = 'Others';
          if((pSDCategoryOther as any).value > 0){
            parSetData.push(pSDCategoryOther);
          }

          let pSDOtherCategory = {};
          pSDOtherCategory['value'] = headerPart[p].currHeaderAmount - headerPart[p].intersectionAmount;
          pSDOtherCategory[dimension1] = 'Others';
          pSDOtherCategory[dimension2] = headerPart[p].label;
          if((pSDOtherCategory as any).value > 0){
            parSetData.push(pSDOtherCategory);
          }

          // let newData = {};
          // newData['value'] = headerPart[p].intersectionAmount;
          // newData[dimension1] = cell.category === categoryLabel ? categoryLabel : 'Others';
          // newData[dimension2] = cell.tableColumn === headerPart[p].label ? headerPart[p].label : 'Others';
          // //keep current row and column at the first position
          // if(cell.category === categoryLabel){
          //   parSetData.unshift(newData);
          // }else
          // {
          //   parSetData.push(newData);
          // }
        }
      }

    }
    console.log('ParSets - data: ', parSetData);
    const that = this;

    // console.log('SVG Conatiner - width: ',width);
    let chart = (<any>d3).parsets()
      .tension(0.5) //[0 .. 1] -> 1 = straight line 
      .dimensions([dimension1, dimension2])
      .value(function (d) {return d.value;})
      .width(svgWidth)
      .height(svgHeight)
      .spacing(10);

    let svgCanvas = miniVisualisation.append('svg')
      .attr('width', chart.width())
      .attr('height', chart.height()+svg2DimLabelHeight);
    // .attr('height',chart.height());
    // .attr('width','100%')
    // .attr('height','100%');

    let svgFigureGroup = svgCanvas.append('g').attr('class', 'parSets');
                                              // .attr('width', chart.width())
                                              // .attr('height', chart.height() + svg2DimLabelHeight);

    // draw parallel sets
    svgFigureGroup.datum(parSetData).call(chart);

    //rotation um 90 von den SVG parallel sets
    //svgFigureGroup.attr('transform','rotate(-90) translate(-'+width+',0)');

    let svgRibbons = svgFigureGroup.selectAll('g.ribbon');
    // console.log('svgRibon: ',svgRibbons);

    //highlight and color ribbons
    this.highlightAndColorParSetsRibbons(this, svgRibbons, dimension1, cell.category, cell.tableColumn);
    svgFigureGroup.selectAll('g.ribbon-mouse').remove();
    svgRibbons.on('.drag',null)

    //move label dimensions underneath parallel sets
    let svgDimensions = svgFigureGroup.selectAll('g.dimension');
    this.moveParSetsDimensionLabels(svgDimensions);
    svgDimensions.selectAll('text.dimension').selectAll('tspan.sort').remove();
    svgDimensions.on('.drag', null);
    svgDimensions.selectAll('g.category').on('.drag', null);

    //highlight label of current path
    this.highlightParSetsSelectedLabel(this, svgDimensions, cell.category);
  }
 
  // highlights the backgroud colour of the label of the selected category in parallel sets vis
  private highlightParSetsSelectedLabel(that, svgDimensions: d3.Selection<any>, category: string)
  {
    // console.log('highlight dimension labels: ', {svgDimensions, category});

    //highlight label of current path
    svgDimensions.selectAll('g')
    .each(function (d) {
      // console.log('dim.g.d: ',d);
      // console.log('dim.g.this: ',d3.select(this));

      //unhiglight all rect for labels
      d3.select(this).select('rect').classed('selected', false);
    
      //highlight rect of label for the selected category
      if (d.name === category) {
        d3.select(this).select('rect').classed('selected', true);
        if (that.getRadioButtonValue() === 'category'){
          let color = that.getColorOfCategory(d.dimension.name.slice(0,-1), d.name);
          if (color !== null) {
            d3.select(this).select('rect').style('fill', color);
          }
        }else{
          d3.select(this).select('rect').style('fill', '#fba74d');
        }
      }

    });  
  }

  // sets the ribbon color and highlights the selected on in the parallel sets vis
  private highlightAndColorParSetsRibbons(that, svgRibbons: d3.Selection<any>, dimensionName: string, category: string, tableColumn: string)
  {
    // console.log('highlight and color ribbons: ', {svgRibbons, dimensionName, category, tableColumn});
    //highlight current path
    let svgPaths = svgRibbons.selectAll('path')
      .each(function (d) {
        d3.select(this).classed('selected', false);

        //the path between the selected row and column will be marked as selected (higher opacity)
        if ((d.parent.name === category && d.node.name === tableColumn) || (d.parent.name === tableColumn && d.node.name === category)) {
          d3.select(this).classed('selected', true);
        }

        if (that.getRadioButtonValue() === 'category') {
          //all paths connected to the category of the dimension will be coloured in category's color
          if((d.parent.dimension === dimensionName && d.parent.name === category) || (d.node.dimension === dimensionName && d.node.name === category)){
            let color = that.getColorOfCategory(dimensionName.slice(0,-1), category);
            if (color !== null) {
              d3.select(this).style('fill', color);
              d3.select(this).style('stroke', color);
            }
          }else{
            d3.select(this).attr('class','category-gray');
          }
        }else{
          d3.select(this).classed('category-selected',true); //make all selected
          if((d.parent.name === 'Others' && d.node.name !== category) || (d.node.name === 'Others' && d.parent.name !== category)) {
            //only the path between others and not the current category are coloured gray
            d3.select(this).classed('category-selected',false);
            d3.select(this).classed('category-gray',true);
          }
        }
        // console.log('path.this: ', d3.select(this));
        // console.log('path.d: ',d);
      });
  }

  // moves the label of the second dimension underneath the parralel sets vis
  private moveParSetsDimensionLabels(svgDimensions: d3.Selection<any>)
  {
    // console.log('move dimension labels: ', {svgDimensions});

    // parameters for the dimension translation
    const dimensionTranslate = [-25,40];
    const categoryTranslate = [0,20];
    let index = 0;

    svgDimensions.each(function (d) {
      // console.log('dim.d: ',d);
      // console.log('dim.this: ',d3.select(this));
       
      //identifiy the current dimension
      if(d.y === 45){
        index = 0;
      }else{
        index = 1;
      }

      const currTransform = d3.select(this).attr('transform').split(',');
      const currTransformX = Number(currTransform[0].split('(')[1]);

      // //dimension label
      d3.select(this).select('rect').attr('transform',`translate(${currTransformX},${dimensionTranslate[index]})`);
      d3.select(this).select('text').attr('transform',`translate(${currTransformX},${dimensionTranslate[index]})`);
      
      // //category labels
      let categoryLabel = d3.select(this).selectAll('g');
      categoryLabel.selectAll('rect').attr('transform',`translate(${currTransformX},${categoryTranslate[index]})`);
      categoryLabel.selectAll('text').attr('transform',`translate(${currTransformX},${categoryTranslate[index]})`);
    });
  }

  // method is called when categories are rearranged in the parallel sets vis
  private sortCategoryParSetsListener(that, category: string, svgElement: string)
  {
    console.log('"sortCategoryParSetsListener" was activated: ', {category,svgElement});

    let svgDimensions = d3.selectAll('div'+svgElement).selectAll('g.parSets').selectAll('g.dimension');
    this.highlightParSetsSelectedLabel(that, svgDimensions, category);

  }

  // method is called when dimensions are rearranged in the parrallel sets vis
  private sortDimensionParSetsListener(that, dimensionName: string, category: string, tableColumn: string, svgElement: string)
  {
    console.log('"sortDimensionParSetsListener" was activated: ', {dimensionName,category,tableColumn,svgElement});
    
    let svgParSets = d3.selectAll('div'+svgElement).selectAll('g.parSets');

    let svgDimensions = svgParSets.selectAll('g.dimension');
    this.highlightParSetsSelectedLabel(that, svgDimensions, category);
    this.moveParSetsDimensionLabels(svgDimensions);

    let svgRibbons = svgParSets.selectAll('g.ribbon');
    this.highlightAndColorParSetsRibbons(that, svgRibbons, dimensionName, category, tableColumn);
  }

  // adds a div element to the mini visualisation with the detail information to the score
  private generateVisualDetails (miniVisualisation: d3.Selection<any>){
    
    let divDetailInfo = miniVisualisation.append('div')
                                    .classed('detailVis',true);

    // let detailTestType = divDetailInfo.append('div');
    divDetailInfo.append('div')
                  .classed('detailDiv',true)
                  .text('Test: ')
                  .append('span')
                  .text('[TestName]');

    // let detailTestValue = divDetailInfo.append('div');
    divDetailInfo.append('div')
                .classed('detailDiv',true)
                .text('Test-Value/p-Value: ')
                .append('span')
                .text('[Value]/[p-Value]');  

    // let detailTestDescr = divDetailInfo.append('div');
    divDetailInfo.append('div')
                  .classed('detailDiv',true)
                  .text('Description: ')
                  .append('span')
                  .text('[Description]');    
  }

  // creates boxplot visualization (for student-test, mwu-test)
  private generateVisulRepBoxPlot(containerId: string, cell: any) 
  {
    console.log('Cell clicken (BoxPlot): ',{containerId, cell});
    let optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;
    
    let oldMiniVisualisation = d3.select(this.itemTab).select('div[class="svg-container '+containerId+'"]');
    oldMiniVisualisation.remove(); //deletes all generated content im 'measuresDivElement'

    let miniVisualisation = d3.select('#'+containerId).append('div')
                                                  .attr('class','svg-container '+containerId);
  
    this.generateVisualDetails(miniVisualisation);

                                                  
    let data = cell.dataVisRep.data.filter((item) => {return (item[0] === cell.tableColumn || item[0] === cell.category);});
    let min = cell.dataVisRep.min;
    let max = cell.dataVisRep.max;
    // console.log('BoxPlot: ',{data,min,max});


    let containerWidth = Number(miniVisualisation.style('width').slice(0,-2)) - 25; //-25 because of the scroll bar

    let calcWidth = Math.max(containerWidth,data.length * 50 + 30);

    let margin = {top: 5, right: 0, bottom: 50, left: 50};
    let  width = calcWidth - margin.left - margin.right;
    let height = 220 - margin.top - margin.bottom;

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
          .height(height)	
          .domain([min, max])
          .showLabels(true);


    let svgCanvas = miniVisualisation.append('svg')
          .attr('width',width + margin.left + margin.right)
          .attr('height',height + margin.top + margin.bottom);      

    let svgFigureGroup = svgCanvas.append('g')
                                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                  .attr('class','boxplot');

    	// the x-axis
    let x = d3.scale.ordinal()	   
    .domain( data.map(function(d) { return d[0] } ) )	    
    .rangeRoundBands([0 , width], 0.7, 0.3); 		

    let xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    // the y-axis
    let y = d3.scale.linear()
      .domain([min, max])
      .range([height + margin.top, 0 + margin.top]);

    let yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    // draw the boxplots	
    svgFigureGroup.selectAll(".boxplot")
      .data(data)
      .enter().append("g")
      .attr('class',function(d,i) {
        let classString = 'box-element';
        let dataLabel = `${d[0]}`;
        let colorLabel = `category-gray`;

        return `${classString} ${dataLabel} ${colorLabel}`;
      })
      .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
      .call(chart.width(x.rangeBand())); 
     
    // add a title
    // svgFigureGroup.append("text")
    //     .attr("x", (width / 2))             
    //     .attr("y", 0 + (margin.top / 2))
    //     .attr("text-anchor", "middle")  
    //     .style("font-size", "18px") 
    //     //.style("text-decoration", "underline")  
    //     .text("Revenue 2012");

    // draw y axis
    svgFigureGroup.append("g")
      .attr("class", "y axis")
      .call(yAxis);
    //   .append("text") // and text1
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", ".71em")
    //   .style("text-anchor", "end")
    //   .style("font-size", "16px") 
    //   .text("Revenue in €");		

    // draw x axis	
    svgFigureGroup.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
      .call(xAxis);
      // .append("text")             // text label for the x axis
      //   .attr("x", (width / 2) )
      //   .attr("y",  10 )
      // .attr("dy", ".71em")
      //   .style("text-anchor", "middle")
      // .style("font-size", "16px") 
      //   .text("Quarter"); 


    let boxElements = svgFigureGroup.selectAll('g.box-element')
                                    .each(function(d) {
                                      d3.select(this).classed('selected',false);
                                      // console.log('box.this: ', d3.select(this));
                                      // console.log('box.d: ',d);
                                      
                                      if(d[0] === cell.tableColumn || d[0] === cell.category){
                                        d3.select(this).classed('selected',true);
                                      }
                                    });

    if(cell.dataVisRep.color)
    {                                
      let rectElements = boxElements.selectAll('rect').style('fill',cell.dataVisRep.color);         
      let cirlceElements = boxElements.selectAll('circle').style('fill',cell.dataVisRep.color).style('stroke','black');              
    }

    let cirlceElements = boxElements.selectAll('circle')
                                    .attr('r',2);

  }

   
  // --------- FORMAT DATA FOR VISUAL REPRESENTATION ---
  // gets the data needed for the different visualisations
  private getDataVisualRepresentation(measure: ISimilarityMeasure, data: Array<any>, groups: Array<any>, tableHeader: Array<any>, column: any, category: any)
  {
    const typeCategorical = 'categorical';
    const typeNumber = 'number';
    const measureTypeA = measure.type.typeA.value;
    const measureTypeB = measure.type.typeB.value;

    if(measureTypeA === typeCategorical && measureTypeB === typeCategorical){
      // combination: categorical/categorical
      // scores: jaccars, overlap
      return this.getColumnPartioningParallelSets(data, groups, tableHeader, column,category);
    }else{
      // combination: number/categorica | categorical/number | number/number
      // score: student-test, wolcoxon rank-sum-test, mwu-test
      return this.getDataValuesBoxplit(data, groups, tableHeader, column, category);
    }
  }


  // creates data for the visual representation of parallel sets
  private getColumnPartioningParallelSets(data: Array<any>, groups: Array<any>, tableHeader: Array<any>, column: any, category: any) {
    console.log('---- getColumnPartioning ----');
    console.log('getColumnPartioning.data',data);
    console.log('getColumnPartioning.groups',groups);
    console.log('getColumnPartioning.tableHeader',tableHeader);
    console.log('getColumnPartioning.column',column);
    console.log('getColumnPartioning.category',category);
    let columnPartitioning = [];
    // const groups = this.ranking.getGroupedData();
    const optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;

    const currAttribute: string = column.column.toString();

    // go through all categories of current coloumn
    for (let i = 0; i < column.categories.length; i++) {
      const currCategory = column.categories[i];
      //gets ids for the selection column (Selected and Unselected)
      let dataIdCurrCategory = [];

      if (this.getRadioButtonValue() === 'group') { // stratification
        //all items of a stratification group
        const currGroup = groups.find(item => {return item.name === currCategory.label});
        dataIdCurrCategory = currGroup.rows;
      } else { //category
        // this case happends in the strand attribute
        let value = currCategory.label === currCategory.name ? currCategory.label : currCategory.name;

        // find all items of the current category
        dataIdCurrCategory = data.filter((item) => {
          return (String (item[currAttribute])) === value;
        });
      }

      const num = dataIdCurrCategory.length;

      const currCategoryParts = {
        attributeLabel: column.label,
        categoryLabel: currCategory.label,
        categoryAmount: num,
        parts: []
      };

      // go through all columns in header
      for (let h = 0; h < tableHeader.length; h++) {
        const currHeader = tableHeader[h];

        if (currHeader.label.length > 0) {
          let dataIdCurrentHeader = []
          if (optionDDA === 'Selection') {
            // Compare categories with selected/unselected
            dataIdCurrentHeader = data.filter(item => {return item['selection'] === currHeader.label});
          } else {
            // Compare categories with stratification groups
            for (let g = 0; g < groups.length; g++) {
              if (groups[g].name === currHeader.label && (groups[g] as any).rows) {
                dataIdCurrentHeader = (groups[g] as any).rows;
              } else if (groups[g].name === currHeader.label && currHeader.label === 'Default') {
                dataIdCurrentHeader = data;
              }
            }
          }

          const currHeaderNum = dataIdCurrentHeader.length;

          const {intersection: intersect} = intersection(dataIdCurrCategory.map((a) => a[currAttribute]), dataIdCurrentHeader.map((a) => a[currAttribute]));
          const numHeader = intersect.length;
          
          const currCatForHead = {
            label: currHeader.label,
            intersectionAmount: numHeader,
            currHeaderAmount: currHeaderNum
          };

          currCategoryParts.parts.push(currCatForHead);
        }
      }

      columnPartitioning.push(currCategoryParts);
    }
    console.log('getColumnPartioning.columnPartitioning',columnPartitioning);
    return columnPartitioning;
  }
 
  // creates data for the visual representation of boxplots
  private getDataValuesBoxplit(data: Array<any>, groups: Array<any>,tableHeader: Array<any>, column: any, category: any)
  {
    console.log('---- getColumnPartioning ----');
    console.log('getColumnPartioning.data',data);
    console.log('getColumnPartioning.groups',groups);
    console.log('getColumnPartioning.tableHeader',tableHeader);
    console.log('getColumnPartioning.column',column);
    console.log('getColumnPartioning.category',category);
    // let columnPartitioning = [];
    // let groups = this.ranking.getGroupedData();
    let optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;

    let rowBoxData = [];
    // let min = Infinity;
    // let max = -Infinity;
    let min = column.domain[0];
    let max = column.domain[1];

    let categoryBoxData = []
    if(optionDDA === 'Selection')
    {
      categoryBoxData.push(''+category.label);
      for(let g=0;g<groups.length;g++)
      // get the values of current category
      {
        if(groups[g].name === category.label && (groups[g] as any).rows)
        {
          let dataCategroy = (groups[g] as any).rows.map((a) => { return Number(a[''+column.column]); });
          let dataCategroyValid = dataCategroy.filter(((item) => item !== undefined || item !== null));

          categoryBoxData.push(dataCategroyValid);
          // min = Math.min(min,Math.min(...(<number[]> dataCategroyValid)));
          // max = Math.max(max,Math.max(...(<number[]> dataCategroyValid)));
          
          rowBoxData.push(categoryBoxData);
        }
      }
    }


    // go through all columns in header 
    for(let h=0; h<tableHeader.length; h++)
    {
      
      let currHeader = tableHeader[h];
      
      if(currHeader.label.length > 0){
        let currBoxData = [];
        //first element is boxplot label
        currBoxData.push(''+currHeader.label);

        let dataCurrentHeader = [];
        if(optionDDA === 'Selection'){
          dataCurrentHeader = data.filter(item => {return item['selection'] === currHeader.label});
        }else{
          for(let g=0;g<groups.length;g++)
          {
            if(groups[g].name === currHeader.label && (groups[g] as any).rows)
            {
              dataCurrentHeader = (groups[g] as any).rows;
            }//else if(groups[g].name === currHeader.label && currHeader.label === 'Default')
            // {
            //   dataCurrentHeader = data;
            // }
          }
        }

        dataCurrentHeader = dataCurrentHeader.map((a) => { return Number(a[''+column.column]); });  
        let dataCurrentHeaderValid = dataCurrentHeader.filter(((item) => item !== undefined || item !== null));
        // min = Math.min(min,Math.min(...(<number[]> dataCurrentHeaderValid)));
        // max = Math.max(max,Math.max(...(<number[]> dataCurrentHeaderValid)));

        // second elemnt is an array with all the values 
        currBoxData.push(dataCurrentHeaderValid);

        // add the boxplot to all boxplots for this row
        rowBoxData.push(currBoxData);
      }
    }
 
    const boxColor = column.color ? column.color : null;
    let rowBoxObj = {
      color: boxColor,
      data: rowBoxData,
      min: min,
      max: max
    };

    console.log({rowBoxData , min, max});

    return rowBoxObj;
  }
 


  // --------- MISC ---
  //generates id for the collapseable panel in the accordion with the prefix and the current time's minutes/seconds and millisec
  private getIdWithTimestamp(prefix: string) {
    let currdate = new Date();
    return prefix + <string><any>currdate.getMinutes() + <string><any>currdate.getSeconds() + <string><any>currdate.getMilliseconds();
  }

  //get the 2 data sets depending on the current configuraiton of the dropdowns and the radio buttons
  private getSelectionAndCategorySets(data, groups: Array<any>, headerCategory: string, columnB: string, categoryB: string) {
    const optionDDA = d3.select(this.itemTab).select('select.compareA').select('option:checked').datum().label;
    // console.time('get groups time')
    // console.group('get groups')
    // const groups = this.ranking.getGroupedData();
    // console.groupEnd();
    // console.timeEnd('get groups time')
    
    let selectionSet = [];
    if (optionDDA === 'Selection') {
      selectionSet = data.filter((item) => item['selection'] === headerCategory);
    } else if (optionDDA === 'Stratification Groups') {
      selectionSet = groups.find((grp) => grp.name === headerCategory).rows;
    }
    // console.log('selectionSet: ',selectionSet);


    let categorySet = [];
    // use categories or stratification as rows
    if (this.getRadioButtonValue() === 'category') {
      categorySet = data.filter((item) => item[columnB] === categoryB);
    } else {
      categorySet = groups.find((grp) => grp.name === categoryB).rows;
    }
    // console.log('categorySet: ',categorySet);

    let dataSets = {
      selectionSet: selectionSet,
      categorySet: categorySet
    };

    return dataSets;
  }

  // calculates the backgound color for the scores (0 -> white, 1 -> dark grey)
  private score2color(measureID: string, score:number, domain = [0, 1])
  {
    let color = '#ffffff' //white
    if(measureID === 'jaccard' || measureID === 'overlap')
    {
      score = score || 0; // fix undefined or NaN

      const linScale = d3.scale.linear().domain(domain).range([255, 110]);
      const darkness = linScale(score); // higher score -> darker color
      const hslColor =  d3.rgb(darkness, darkness, darkness);
      color = hslColor.toString();

    }else
    {
      if(score <= 0.05)
      {
        // console.log('bg color cahnge')
        let calcColor = d3.scale.linear().domain([0,0.05])
                                          .range(<any[]>['#A9A9A9', '#FFFFFF']);
                                          
        color = calcColor(score).toString();
      }
    }


    return color;
  }

  // gets the color of a category of a column (attribute)
  private getColorOfCategory(column: string, category: string){
    // console.log('path.column: ',column);
    // console.log('path.category: ',category);
    let color = null;
    if(column === 'Selection'){
      if(category === 'Selected'){
        color = '#1f77b4';
      }else {
        color = '#ff7f0e';
      }
    }else {
      let currColumn = this.ranking.getDisplayedAttributes().filter((item) => {return (item.desc.label === column);});
      for(let col=0;col<currColumn.length;col++){ 
        if(currColumn[col] && (currColumn[col] as ICategoricalColumn).categories)
        {
          let currCategories = (currColumn[col] as ICategoricalColumn).categories;
          for(let i=0; i<currCategories.length; i++){
            if(currCategories[i].label === category){
              color = currCategories[i].color;
            }
          }
        }
      }
    }
    
    // console.log('path.color: ',color);
    return color;
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
      descriptions.unshift(this.ranking.getSelectionDesc());
      descriptions.unshift(this.ranking.getRankDesc())
      descriptions = descriptions.filter((desc) => ['categorical', 'number'].includes(desc.type)); // filter attributes by type
      descriptions.forEach((desc) => {
        (desc as any).categories = stratDesc.categories; // Replace real categopries with those from stratification
      });
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
      console.log('Open Touring Panel')
      //if touring is displayed, ensure the panel is visible
      this.node.style.flex = "0.33 0.33 auto"; // lineup is 1 1 auto
      this.collapse = false;
      this.updateTouringPanel();
    } else {
      this.node.style.flex = null;
    }
    
    const button = d3.select(this.node).select('.lu-side-panel button.touring')
    button.classed('active', !hide);
  }

  private prepareInput = (dropdown: d3.Selection<any>) => {
    const desc = dropdown.select('option:checked').datum(); // get selected option
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

    return dropdown.selectAll('option').data().filter((desc) => filter.includes(desc.type)); // filter from all options
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


  private getScoreColumns() {
    return this.getDisplayedAttributes().filter((attr) => (attr.desc as any)._score);
  }


  private oldOrder: Array<number> = new Array();
  private oldSelection : Array<number> = new Array();
  private oldAttributes: Array<Column> = new Array();
  private data: Array<any>;

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
  public getItemsDisplayed(): Array<Object> {
    const allItems = this.getItems();
    // get currently displayed data
    return this.getItemOrder().map(rowId => allItems[rowId]);
  }


  public getItems(): Array<Object>{
    // if the attributes are the same, we can reuse the data array
    // if the selection

    // TODO events may be better?
    const sameAttr = this.oldAttributes.length === this.getDisplayedAttributes().length && this.oldAttributes.filter((attr) => /*note the negation*/ !this.getDisplayedAttributes().some((attr2) => attr2.desc.label === attr.desc.label)).length === 0;
    const sameSel = this.oldSelection.length === this.getSelection().length && this.oldSelection.every((val, i) => this.getSelection()[i] === val);
    const sameOrder = this.oldOrder.length === this.getItemOrder().length && this.oldOrder.every((val, i) => this.getItemOrder()[i] === val);

    if (sameAttr && sameSel && sameOrder) {
      // NOOP
      // attributes have to be the same (added / remvoed columns)
      // selection has to be the same                                                 TODO just updated selection data
      // item order has to be the same (i.e. the same  items order in the same way)   TODO just update the rank, the filtering is done in getItemsDisplayed

      // console.log('reuse the data array')
    } else {
      console.log('update the data array')
      // refresh the data array
      this.data = null;
      this.oldAttributes = this.getDisplayedAttributes();

      const databaseData = new Array();

      const scoreCols = this.getScoreColumns();
      const scoresData = [].concat(...scoreCols.map((col) => this.getScoreData(col.desc)));
  
      this.oldOrder = this.getItemOrder();
      this.oldSelection = this.getSelection();

      this.provider.data.forEach((item, i) => {
        let index = this.oldOrder.indexOf(i)
        item.rank = index >=0 ? index : Number.NaN; //NaN if not found

        // include wether the row is selected
        item.selection = this.oldSelection.includes(i) ? 'Selected' : 'Unselected'; // TODO compare perfomance with assiging all Unselected and then only set those from the selection array
        item.strat_groups = this.getRanking().getGroups().findIndex((grp) => grp.order.indexOf(i) >= 0); // index of group = category name, find index by looking up i. -1 if not found
        databaseData.push(item);
      })
  
      // merge score and database data
      this.data = [...databaseData.concat(scoresData)
        .reduce((map, curr) => {
          map.has(curr.id) || map.set(curr.id, {}); //include id in map if not already part of it, initialize with empty object
          
          const item = map.get(curr.id); // get stored data for this id
  
          Object.entries(curr).forEach(([k, v]) => item[k] = v ); // add the content of the current array item to the data already stored in the map's entry (overwrites if there are the same properties in databaseData and scoreColumn)
          
          return map;
        }, new Map()).values()]; // give map as input and return it's value
    }

    return this.data;
  }

  private getItemOrder() {
    // order is always defined for groups (rows (data) only if there is an stratification)
    return [].concat(...this.getRanking().getGroups().map((grp) => grp.order)); // Map groups to order arrays and concat those

  }

  public getDisplayedIds() {
    const items = this.provider.data;
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
   * Contains  selection, rank and score data.
   */
  public getGroupedData() {
    // console.time('get data (getGroupedData) time')
    const data = this.getItems();
    // console.timeEnd('get data (getGroupedData) time')
    let groups = []

    for (let grp of this.getRanking().getGroups()) {
      groups.push({
        name: grp.name,
        color: grp.color,
        rows: grp.order.map((index) => data[index]).filter((item) => item !== undefined)
      });
    }
    return groups;  
  }


  /**
   * returns the data for the given attribute
   * @param attributeId column property of the column description
   */
  public getAttributeDataDisplayed(attributeId: string) { //  use lower case string
    const data = this.getItemsDisplayed();
    return data.map((row) => String(row[attributeId]));
  }

  /**
   * returns the categories of the given attribute
   * @param attributeId column property of the column description
   */
  public getAttributeCategoriesDisplayed(attributeId: string) {
    return new Set(this.getAttributeDataDisplayed(attributeId))
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
