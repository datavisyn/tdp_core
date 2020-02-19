import {SearchBox} from 'lineupjs';
import {ISearchOption} from '../LineUpPanelActions';
import {IPanelButton} from './PanelButton';
import i18n from 'phovea_core/src/i18n';

/**
 * Div HTMLElement that contains a button and a SearchBox.
 * The SearchBox is by default hidden and can bit toggled by the button
 */
export default class PanelAddColumnButton implements IPanelButton {
  readonly node: HTMLElement;
  /**
   *
   * @param parent The parent HTML DOM element
   * @param search LIneup SearchBox instance
   */
  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('lu-adder');
    this.node.addEventListener('mouseleave', () => {
      this.node.classList.remove('once');
    });

    const button = this.node.ownerDocument.createElement('button');
    button.classList.add('fa', 'fa-plus');
    button.title = i18n.t('tdp:core.lineup.LineupPanelActions.addColumnButton');

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
