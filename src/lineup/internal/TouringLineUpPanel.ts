import LineUpPanelActions from './LineUpPanelActions';

export default class TouringLineUpPanel extends LineUpPanelActions {
  
  protected init() {
    super.init();
    const buttons = this.node.querySelector('section');
    buttons.appendChild(this.createMarkup('Start Touring', 'fa fa-bar-chart', () => {
      console.log('start touring')
    }));
  }
}

