import {SidePanel, spaceFillingRule, IGroupSearchItem, exportRanking, SearchBox, LocalDataProvider, createStackDesc, IColumnDesc, createScriptDesc, createSelectionDesc, createAggregateDesc, createGroupDesc, Ranking, createImpositionDesc, createNestedDesc, createReduceDesc} from 'lineupjs';
import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, TYPE, ISImilarityMeasure} from 'touring';
import * as d3 from 'd3'
import { DummyDataType, defineDataType } from '../../../../node_modules/phovea_core/src/datatype';

export default class TouringLineUpPanel extends LineUpPanelActions {

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

    const that = this;

    //let dropdownItemCopareA = <HTMLSelectElement>this.getDropdownELementbyClassName('itemControls compareA');
    //let dropdownItemCopareB = <HTMLSelectElement>this.getDropdownELementbyClassName('itemControls compareB');

    //column of a table was added
    this.provider.on(LocalDataProvider.EVENT_ADD_COLUMN, (col, i) => {
      //console.log('event added column', col, 'index', i)
      if(col.desc && (col.desc.type === 'categorical' || col.desc.type === 'number' || col.desc.type === 'string')) {
        this.updateDropdowns('add',col.desc);
        //this.addOptionToDropdown(dropdownItemCopareA,col.desc);
      }
    });

    //column of a table was removed
    this.provider.on(LocalDataProvider.EVENT_REMOVE_COLUMN, (col, i) => {
      //console.log('event removed column', col, 'index', i)
      if(col.desc && (col.desc.type === 'categorical' || col.desc.type === 'number' || col.desc.type === 'string')) {
        this.updateDropdowns('remove',col.desc);
        //this.removeOptionFromDropdown(dropdownItemCopareA,col.desc);
      }
    });

    
    
    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-bar-chart', () => {
      this.toggleTouring();
      
      
      //console.log('provider',this.provider);
      //console.log('provider.getSelection: ',this.provider.getSelection());
      //console.log('provider.getSelection: ',this.provider.getSelection());
      //console.log('provider.selectedRows: ',this.provider.selectedRows());
      //console.log('provider.getColumns: ',this.provider.getColumns());
      //console.log('provider.getRankings()[0].children: ',this.provider.getRankings()[0].children);
      //console.log('provider.getRanking: ',this.provider.getRankings());
      //console.log('provider.getFilter: ',this.provider.getFilter());
      //console.log('------------------------------------');

      
      //change radio button
      d3.selectAll('input[name="compareGroup"]').on('change', function(){
        //console.log('radio button value: ',this.value, ' | object: ', this);

        that.updateDropdowns();
        //that.updateDropdownDependingOnRadioButton(dropdownItemCopareB,this.value);
      });


      
      // change in selection 
      this.provider.on(LocalDataProvider.EVENT_SELECTION_CHANGED, (indices) => {
        //console.log('selection changed, indices: ', indices);
        that.updateTouringData();
      });
      
      //for changes made in dropdown
      d3.selectAll('select[class="form-control itemControls compareA"]').on('input', function(){
        //console.log('changed dropdown value: ',this.value);
        //console.log('changed dropdown selectedOption: ',this.selectedOptions);
        that.updateTouringData();
        
      }); 

      d3.selectAll('select[class="form-control itemControls compareB"]').on('input', function(){
        console.log('changed dropdown value: ',this.value);
        //console.log('changed dropdown selectedOption: ',this.selectedOptions);
        that.updateTouringData();
        
      }); 
      

      const descriptions = this.provider.getRankings()[0].children.map((col) => col.desc);
      const setMeasures = MethodManager.getSetMethods([{label: 'Selection', type: TYPE.CATEGORICAL}], descriptions);

      console.log('set measures', setMeasures);

      for(let [type, typeMeasures] of setMeasures) {
        console.log('#1 '+type, typeMeasures[0]);

        this.insertMeasure(typeMeasures[0])
      }
    }));
    

    //this.updateDropdowns();
    //this.initItemDropdowns(dropdownItemCopareB);
    
  }

  private insertMeasure(measure: ISImilarityMeasure) {
    const measuresDiv = <HTMLElement>this.node.querySelector('.measures')!;

    // Headline
    measuresDiv.insertAdjacentHTML('beforeend', `<h4>${measure.label}</h4>`)

    // Table
    // TODO
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
    
    //onsole.log('current data: ', currentData);
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

