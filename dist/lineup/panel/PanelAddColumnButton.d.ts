import { SearchBox } from 'lineupjs';
import { ISearchOption } from './ISearchOption';
import { IPanelButton, IPanelButtonOptions } from './PanelButton';
export declare type IPanelAddColumnButtonOptions = Pick<IPanelButtonOptions, 'btnClass'>;
/**
 * Div HTMLElement that contains a button and a SearchBox.
 * The SearchBox is hidden by default and can be toggled by the button.
 */
export declare class PanelAddColumnButton implements IPanelButton {
    private readonly search;
    readonly node: HTMLElement;
    /**
     *
     * @param parent The parent HTML DOM element
     * @param search LineUp SearchBox instance
     */
    constructor(parent: HTMLElement, search: SearchBox<ISearchOption>, options?: IPanelAddColumnButtonOptions);
}
//# sourceMappingURL=PanelAddColumnButton.d.ts.map