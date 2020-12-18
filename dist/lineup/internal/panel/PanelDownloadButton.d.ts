import { LocalDataProvider } from 'lineupjs';
import { IPanelButton } from './PanelButton';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelDownloadButton implements IPanelButton {
    private provider;
    readonly node: HTMLElement;
    private orderedRowIndices;
    constructor(parent: HTMLElement, provider: LocalDataProvider, isTopMode: boolean);
    private updateNumRowsAttributes;
    /**
     * Add event listener to LineUp data provider and
     * update the number of rows in the dataset attributes for different row types.
     */
    private addLineUpEventListner;
    private sortValues;
    private customizeDialog;
    private resortAble;
    private downloadFile;
}
