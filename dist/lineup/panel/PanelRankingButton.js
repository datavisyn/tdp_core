import { PanelButton } from './PanelButton';
/**
 * Plain HTML button with a custom title, CSS class and an onClick function.
 * Injects through the onClick callback the current ranking.
 */
export class PanelRankingButton {
    constructor(parent, provider, title, cssClass, faIcon, onClick) {
        this.provider = provider;
        this.node = new PanelButton(parent, {
            title,
            faIcon,
            cssClass,
            onClick: () => {
                const firstRanking = this.provider.getRankings()[0];
                if (firstRanking) {
                    onClick(firstRanking);
                }
            },
        }).node;
    }
}
//# sourceMappingURL=PanelRankingButton.js.map