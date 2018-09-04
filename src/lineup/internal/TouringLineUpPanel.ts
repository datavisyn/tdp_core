import LineUpPanelActions from './LineUpPanelActions';

export default class TouringLineUpPanel extends LineUpPanelActions {

  private touringElem : HTMLElement;
  
  protected init() {
    super.init();
    this.node.insertAdjacentHTML('beforeend', `<div class="touring" hidden>
    <p>Hello World</p>
    </div>`);
    this.touringElem = <HTMLElement>this.node.querySelector('.touring');

    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-bar-chart', () => {
      console.log('start touring')

      const columnOverview = <HTMLElement>this.node.querySelector('main')!;
      const searchbox = <HTMLElement>this.node.querySelector('.lu-adder')!;
      const itemCounter = <HTMLElement>this.node.querySelector('.lu-stats')!;

      if (columnOverview.hidden === true) {
        searchbox.hidden = false;
        itemCounter.hidden = false;
        columnOverview.hidden = false;

        this.touringElem.hidden = true;
      } else {
        searchbox.hidden = true;
        itemCounter.hidden = true;
        columnOverview.hidden = true;

        this.touringElem.hidden = false;
      }
       


    }));
  }
}

