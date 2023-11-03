import { LocalDataProvider, Ranking } from 'lineupjs';
import { IPanelButton } from './PanelButton';
/**
 * Plain HTML button with a custom title, CSS class and an onClick function.
 * Injects through the onClick callback the current ranking.
 */
export declare class PanelRankingButton implements IPanelButton {
    private provider;
    readonly node: HTMLElement;
    constructor(parent: HTMLElement, provider: LocalDataProvider, title: string, cssClass: string, faIcon: string, onClick: (ranking: Ranking) => void);
}
//# sourceMappingURL=PanelRankingButton.d.ts.map