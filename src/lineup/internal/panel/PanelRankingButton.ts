import {IPanelButton, PanelButton} from './PanelButton';
import {LocalDataProvider, Ranking} from 'lineupjs';

/**
 * Plain HTML button with a custom title, CSS class and an onClick function.
 * Injects through the onClick callback the current ranking.
 */
export class PanelRankingButton implements IPanelButton {
  readonly node: HTMLElement;

  constructor(parent: HTMLElement, private provider: LocalDataProvider, title: string, cssClass: string, faIcon: string, onClick: (ranking: Ranking) => void) {
    this.node = new PanelButton(parent, {
      title,
      faIcon,
      cssClass,
      onClick: () => {
        const firstRanking = this.provider.getRankings()[0];
        if (firstRanking) {
          onClick(firstRanking);
        }
      }
    }).node;
  }
}
