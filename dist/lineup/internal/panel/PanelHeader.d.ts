import { IPanelButton } from './PanelButton';
/**
 * The panel header contains a list of panel buttons.
 */
export declare class PanelHeader {
    readonly node: HTMLElement;
    private buttons;
    /**
     *
     * @param parent The parent HTML DOM element.
     * @param isTopMode Is the SidePanel collapsed or not.
     */
    constructor(parent: HTMLElement);
    /**
     * Add a panel button to this header
     * @param button Panel button instance to add
     */
    addButton(button: IPanelButton): void;
}
