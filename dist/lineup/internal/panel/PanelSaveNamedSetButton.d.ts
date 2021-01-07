import { IPanelButton } from './PanelButton';
import { EventHandler } from 'phovea_core';
import { LineUpOrderedRowIndicies } from './LineUpOrderedRowIndicies';
/**
 * A button dropdown to download selected/all rows of the ranking
 */
export declare class PanelSaveNamedSetButton extends EventHandler implements IPanelButton {
    static readonly EVENT_SAVE_NAMED_SET = "saveNamedSet";
    readonly node: HTMLElement;
    constructor(parent: HTMLElement, lineupOrderRowIndices: LineUpOrderedRowIndicies, isTopMode: boolean);
}
