import LineUpPanelActions from './LineUpPanelActions';

export default class TouringLineUpPanel extends LineUpPanelActions {

  private touringElem : HTMLElement;
  private columnOverview : HTMLElement; searchbox : HTMLElement; itemCounter : HTMLElement; // default sidepanel elements
  
  protected init() {
    super.init();
    this.node.insertAdjacentHTML('beforeend', `<div class="touring" hidden>
      <p>Hello World! My name is Touring Panel and I'm from Linz, Austrria.</p>
    </div>`);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');
    
    this.columnOverview = <HTMLElement>this.node.querySelector('main')!;
    this.searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
    this.itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-bar-chart', () => {
      console.log('start touring')
      
      this.toggleTouring();

      // TODO adder as dropdown?
      // TODO restore panel on touring click
    }));
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

