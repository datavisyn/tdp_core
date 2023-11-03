import { SidePanel, SearchBox, IEngineRankingContext, IRenderContext, IRankingHeaderContextContainer } from 'lineupjs';
import { EventHandler } from 'visyn_core/base';
import { ISearchOption } from './ISearchOption';
import { PanelButton, PanelNavButton } from './PanelButton';
import { IPanelTabDesc } from './IPanelTabDesc';
/**
 * The PanelTab creates a tab component that with can be toggled through the PanelNavButton
 */
export declare class PanelTab extends EventHandler {
    private parent;
    static readonly SHOW_PANEL = "showPanel";
    static readonly HIDE_PANEL = "hidePanel";
    readonly node: HTMLElement;
    readonly options: IPanelTabDesc;
    private navButton;
    /**
     * @param parent The parent HTML DOM element
     * @param options Extra styles to apply to the PanelTab
     */
    constructor(parent: HTMLElement, options?: IPanelTabDesc);
    /**
     * Show this tab and fire the `PanelTab.SHOW_PANEL` event.
     */
    show(): void;
    /**
     * Hide this tab and fire the `PanelTab.HIDE_PANEL` event.
     */
    hide(): void;
    getNavButton(listener: any): PanelNavButton;
    getShortcutButton(): PanelButton;
}
/**
 * Default active PanelTab
 * Contains LineUp SidePanel and LineUp SearchBox
 */
export declare class SidePanelTab extends PanelTab {
    private readonly search;
    readonly panel: SidePanel | null;
    /**
     * @param parent The parent HTML DOM element
     * @param search LineUp SearchBox
     * @param ctx LineUp context
     * @param doc Document
     */
    constructor(parent: HTMLElement, search: SearchBox<ISearchOption>, ctx: IRankingHeaderContextContainer & IRenderContext & IEngineRankingContext, doc?: Document, options?: IPanelTabDesc);
}
//# sourceMappingURL=PanelTab.d.ts.map