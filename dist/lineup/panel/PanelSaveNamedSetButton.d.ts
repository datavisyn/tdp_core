import { EventHandler } from 'visyn_core/base';
import { LineUpOrderedRowIndicies } from './LineUpOrderedRowIndicies';
import { IPanelButton } from './PanelButton';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelSaveNamedSetButton extends EventHandler implements IPanelButton {
    static readonly EVENT_SAVE_NAMED_SET = "saveNamedSet";
    readonly node: HTMLElement;
    constructor(parent: HTMLElement, lineupOrderRowIndices: LineUpOrderedRowIndicies, isTopMode: boolean);
}
//# sourceMappingURL=PanelSaveNamedSetButton.d.ts.map