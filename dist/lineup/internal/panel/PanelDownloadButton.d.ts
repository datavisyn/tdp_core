import { LocalDataProvider } from 'lineupjs';
import { IPanelButton } from './PanelButton';
import { LineUpOrderedRowIndicies } from './LineUpOrderedRowIndicies';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelDownloadButton implements IPanelButton {
    readonly node: HTMLElement;
    constructor(parent: HTMLElement, provider: LocalDataProvider, lineupOrderRowIndices: LineUpOrderedRowIndicies, isTopMode: boolean);
    private convertRanking;
    private customizeDialog;
    private downloadFile;
}
