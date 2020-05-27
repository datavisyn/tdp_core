/**
 * Plain HTML button with a custom title, CSS class and an onClick function.
 * Injects through the onClick callback the current ranking.
 */
export class PanelRankingButton {
    constructor(parent, provider, title, linkClass, onClick) {
        this.provider = provider;
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
//# sourceMappingURL=PanelRankingButton.js.map