import {IPanelButton} from './PanelButton';
import {LocalDataProvider, Ranking} from 'lineupjs';

export default class PanelRankingButton implements IPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private provider: LocalDataProvider, title: string, linkClass: string, onClick: (ranking: Ranking) => void) {
    this.node = parent.ownerDocument.createElement('button');
    this.node.className = linkClass;
    this.node.title = title;
    this.node.addEventListener('click', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      const firstRanking = this.provider.getRankings()[0];
      if (firstRanking) {
        onClick(firstRanking);
      }
    });
  }
}
