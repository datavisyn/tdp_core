/**
 * Created by sam on 03.03.2017.
 */
import { ProvenanceGraph, IMixedStorageProvenanceGraphManagerOptions } from 'phovea_core';
import { AppHeader } from 'phovea_ui';
import 'phovea_ui/dist/webpack/_bootstrap';
import { CLUEGraphManager, LoginMenu, ACLUEWrapper } from 'phovea_clue';
import { TourManager } from './tour/TourManager';
export interface ITDPOptions {
    /**
     * alternative login formular
     */
    loginForm: string | undefined;
    /**
     * name of this application
     */
    name: string;
    /**
     * prefix used for provenance graphs and used to identify matching provenance graphs
     */
    prefix: string;
    /**
     * Show/hide the EU cookie disclaimer bar from `cookie-bar.eu`
     */
    showCookieDisclaimer: boolean;
    showResearchDisclaimer: boolean | ((content: HTMLElement) => void);
    showAboutLink: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * show/hide the options link
     * default: false
     */
    showOptionsLink: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * show/hide the bug report link
     * default: true
     */
    showReportBugLink: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * show help link true or the url to link
     * default: false
     */
    showHelpLink: boolean | string;
    /**
     * default: true
     */
    enableProvenanceUrlTracking?: boolean;
    /**
     * options passed to the IProvenanceGraphManager
     */
    provenanceManagerOptions?: IMixedStorageProvenanceGraphManagerOptions;
}
/**
 * base class for TDP based applications
 */
export declare abstract class ATDPApplication<T> extends ACLUEWrapper {
    static readonly EVENT_OPEN_START_MENU = "openStartMenu";
    protected readonly options: ITDPOptions;
    protected app: Promise<T>;
    protected header: AppHeader;
    protected loginMenu: LoginMenu;
    protected tourManager: TourManager;
    constructor(options?: Partial<ITDPOptions>);
    protected createHeader(parent: HTMLElement): AppHeader;
    protected buildImpl(body: HTMLElement): {
        graph: Promise<ProvenanceGraph>;
        manager: CLUEGraphManager;
        storyVis: () => Promise<import("phovea_clue").VerticalStoryVis>;
        provVis: () => Promise<import("phovea_clue").LayoutedProvVis>;
    };
    /**
     * customize the using extension point
     */
    private customizeApp;
    private cleanUpOld;
    /**
     * build the actual main application given the arguments
     * @param {ProvenanceGraph} graph the resolved current provenance graph
     * @param {CLUEGraphManager} manager its manager
     * @param {HTMLElement} main root dom element
     * @returns {PromiseLike<T> | T}
     */
    protected abstract createApp(graph: ProvenanceGraph, manager: CLUEGraphManager, main: HTMLElement): PromiseLike<T> | T;
    /**
     * triggered after the user is logged in and the session can be started or continued
     * @param {T} app the current app
     */
    protected abstract initSessionImpl(app: T): any;
}
