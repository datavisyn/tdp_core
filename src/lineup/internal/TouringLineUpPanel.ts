import LineUpPanelActions from './LineUpPanelActions';
import panelHTML from 'html-loader!./TouringPanel.html'; // webpack imports html to variable
import {MethodManager, TYPE} from 'touring';

export default class TouringLineUpPanel extends LineUpPanelActions {

  private touringElem : HTMLElement;
  private columnOverview : HTMLElement; searchbox : HTMLElement; itemCounter : HTMLElement; // default sidepanel elements
  
  protected init() {
    super.init();
    this.node
    this.node.insertAdjacentHTML('beforeend', panelHTML);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');
    
    this.columnOverview = <HTMLElement>this.node.querySelector('main')!;
    this.searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
    this.itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-bar-chart', () => {
      this.toggleTouring();

      const descriptions = this.provider.getRankings()[0].children.map((col) => col.desc);
      const setMeasures = MethodManager.getSetMethods([{label: 'Selection', type: TYPE.CATEGORICAL}], descriptions);

      console.log('set measures', setMeasures);

      for(let [type, typeMeasures] of setMeasures) {
        console.log('#1 '+type, typeMeasures[0]);

        console.log(typeMeasures[0].calc([1,2,3], [2,4,6]))
      }
    }));
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
  private updateDropdowns() {
    // Compare A:
    // Selected Rows, if there are any (otherwise hide)
    // Stratification Groups, if there are any (otherwise hide)
    // if there are no selected rows and no stratification groups, then display an appropriate message

    // Compare B:
    // Compare to 
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

