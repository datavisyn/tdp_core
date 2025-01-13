import { LocalDataProvider } from 'lineupjs';
import { LineUpOrderedRowIndicies } from './LineUpOrderedRowIndicies';
import type { IPanelButton } from './PanelButton';
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