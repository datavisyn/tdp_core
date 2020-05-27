import { LocalDataProvider } from 'lineupjs';
import { IPanelButton } from './PanelButton';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelDownloadButton implements IPanelButton {
    private provider;
    readonly node: HTMLElement;
    constructor(parent: HTMLElement, provider: LocalDataProvider, isTopMode: boolean);
    private downloadFile;
}
