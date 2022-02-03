import { IPanelButton } from './PanelButton';
export declare enum EPanelHeaderToolbar {
    NAV = 0,
    START = 1,
    CENTER = 2,
    END = 3
}
/**
 * The panel header contains a list of panel buttons.
 */
export declare class PanelHeader {
    node: HTMLElement;
    private navToolbar;
    private startToolbar;
    private centerToolbar;
    private endToolbar;
    private buttons;
    /**
     *
     * @param parent The parent HTML DOM element.
     * @param isTopMode Is the SidePanel collapsed or not.
     */
    constructor(parent: HTMLElement);
    private createToolbar;
    /**
     * Add a panel button to this header
     * @param button Panel button instance to add
     */
    addButton(button: IPanelButton, position: EPanelHeaderToolbar): void;
}
//# sourceMappingURL=PanelHeader.d.ts.map