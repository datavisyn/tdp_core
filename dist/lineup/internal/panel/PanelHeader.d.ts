import { IPanelButton } from './PanelButton';
export declare enum EPanelHeaderToolbar {
    NAV = 0,
    TOP = 1,
    CENTER = 2,
    BOTTOM = 3
}
/**
 * The panel header contains a list of panel buttons.
 */
export declare class PanelHeader {
    readonly node: HTMLElement;
    private readonly navToolbar;
    private readonly topToolbar;
    private readonly centerToolbar;
    private readonly bottomToolbar;
    private buttons;
    /**
     *
     * @param parent The parent HTML DOM element.
     * @param isTopMode Is the SidePanel collapsed or not.
     */
    constructor(parent: HTMLElement);
    createToolbar(): HTMLDivElement;
    /**
     * Add a panel button to this header
     * @param button Panel button instance to add
     */
    addButton(button: IPanelButton, position: EPanelHeaderToolbar): void;
}
