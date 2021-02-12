import {SearchBox} from 'lineupjs';
import {ISearchOption} from './ISearchOption';
import {IPanelButton} from './PanelButton';
import {I18nextManager} from 'phovea_core';

/**
 * Div HTMLElement that contains a button and a SearchBox.
 * The SearchBox is hidden by default and can be toggled by the button.
 */
export class PanelAddColumnButton implements IPanelButton {
  readonly node: HTMLElement;
  /**
   *
   * @param parent The parent HTML DOM element
   * @param search LineUp SearchBox instance
   */
  constructor(parent: HTMLElement, private readonly search: SearchBox<ISearchOption>) {
    this.node = parent.ownerDocument.createElement('div');
    this.node.classList.add('lu-adder');
    this.node.addEventListener('mouseleave', () => {
      this.node.classList.remove('once');
    });

    const button = this.node.ownerDocument.createElement('button');
    button.classList.add('fas', 'fa-plus');
    button.title = I18nextManager.getInstance().i18n.t('tdp:core.lineup.LineupPanelActions.addColumnButton');

    button.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.node.classList.add('once');
      (<HTMLElement>this.search.node.querySelector('input'))!.focus();
      this.search.focus();
    });

    this.node.appendChild(button);
    this.node.appendChild(this.search.node);
  }
}
