import {SearchBox} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import {ILineUpPanelButton} from './LineUpPanelButton';

export default class LineUpPanelAddColumnButton implements ILineUpPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('lu-adder');

    this.node.addEventListener('mouseleave', () => {
      this.node.classList.remove('once');
    });

    const button = this.node.ownerDocument.createElement('button');
    button.classList.add('fa', 'fa-plus');
    button.title = 'Add Column';

    button.addEventListener('click', (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.node.classList.add('once');
      (<HTMLElement>this.search.node.querySelector('input'))!.focus();
      this.search.focus();
    });

    this.node.appendChild(button);
    this.node.appendChild(this.search.node);
  }
}
