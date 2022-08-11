import { LocalDataProvider } from 'lineupjs';
import type { IPanelButton } from './PanelButton';
import { LineUpOrderedRowIndicies } from './LineUpOrderedRowIndicies';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelDownloadButton implements IPanelButton {
    readonly node: HTMLElement;
    constructor(parent: HTMLElement, provider: LocalDataProvider, lineupOrderRowIndices: LineUpOrderedRowIndicies, isTopMode: boolean);
    private customizeDialog;
    private resortAble;
    private downloadFile;
}
//# sourceMappingURL=PanelDownloadButton.d.ts.map