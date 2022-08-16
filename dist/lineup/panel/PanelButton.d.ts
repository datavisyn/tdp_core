import { IPanelTabDesc } from './IPanelTabDesc';
/**
 * Interface for the LineUp panel button
 */
export interface IPanelButton {
    /**
     * DOM node of the LineUp panel button
     */
    readonly node: HTMLElement;
}
export interface IPanelButtonOptions {
    title?: string;
    faIcon: string;
    cssClass?: string;
    onClick: () => void;
    /**
     * add a custom button class
     * @example: btn-primary, btn-text-warning
     * @default: btn-text-dark
     */
    btnClass?: string;
}
/**
 * Plain HTML button with a custom title, CSS class and an onClick function
 */
export declare class PanelButton implements IPanelButton {
    readonly node: HTMLElement;
    private readonly options;
    /**
     * Constructor of the PanelButton
     * @param parent The parent HTML DOM element
     * @param options Options to configure button
     */
    constructor(parent: HTMLElement, options: IPanelButtonOptions);
}
/**
 * HTML button with a custom title, CSS class, an onClick function
 * Acts as tab header/button and highlights itself when clicked depending on if the tab body is open or closed
 */
export declare class PanelNavButton implements IPanelButton {
    readonly node: HTMLElement;
    readonly order: number;
    /**
     * Constructor of the PanelButton
     * @param parent The parent HTML DOM element
     * @param onClick Function that should be executed on button click
     * @param options Options to customize the PanelNavButton
     */
    constructor(parent: HTMLElement, onClick: () => void, options: IPanelTabDesc);
    /**
     * Set the active class to this button
     * @param isActive Toggle the class
     */
    setActive(isActive: boolean): void;
    /**
     * Trigger click event on anchor element.
     */
    click(): void;
}
//# sourceMappingURL=PanelButton.d.ts.map