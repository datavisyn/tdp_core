/**
 * Created by sam on 03.03.2017.
 */
import { ProvenanceGraph, IMixedStorageProvenanceGraphManagerOptions } from 'phovea_core';
import { AppHeader } from 'phovea_ui';
import 'phovea_ui/dist/webpack/_bootstrap';
import { CLUEGraphManager, LoginMenu, ACLUEWrapper } from 'phovea_clue';
import { TourManager } from './tour/TourManager';
import { IAuthorizationConfiguration } from './auth';
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
     * Show/hide the options link
     * @default: false
     */
    showOptionsLink: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * Show/hide the bug report link
     * @default: true
     */
    showReportBugLink: boolean | ((title: HTMLElement, content: HTMLElement) => void);
    /**
     * Show help link (`true`) or the url to link
     * @default: false
     */
    showHelpLink: boolean | string;
    /**
     * Show tour link if set to true and registered tours are available.
     */
    showTourLink: boolean;
    /**
     * Show/hide the `Analysis Session Managment` menu in the header
     * @default: true
     */
    showProvenanceMenu?: boolean;
    /**
     * default: true
     */
    enableProvenanceUrlTracking?: boolean;
    /**
     * options passed to the IProvenanceGraphManager
     */
    provenanceManagerOptions?: IMixedStorageProvenanceGraphManagerOptions;
    /**
     * Client configuration which is automatically populated by the '/clientConfig.json' on initialize.
     * To enable the asynchronous loading of the client configuration, pass an object (optionally with default values).
     * Passing falsy values disables the client configuration load.
     */
    clientConfig?: {
        /**
         * Configuration for the TDPTokenManager.
         */
        tokenManager?: {
            /**
             * Initial authorization configurations.
             * Note that this is an object, because then the deep-merge with the local and remote config is easier.
             */
            authorizationConfigurations?: {
                [id: string]: Omit<IAuthorizationConfiguration, 'id'>;
            };
        };
        [key: string]: any;
    } | null | undefined;
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
    /**
     * Initialize async parts
     * TODO make public and remove call in constructor in the future
     */
    protected initialize(): Promise<void>;
    /**
     * Loads the client config from '/clientConfig.json' and parses it.
     */
    static loadClientConfig<T = any>(): Promise<T | null>;
    /**
     * Loads the client configuration via `loadClientConfig` and automatically merges it into the options.
     * @param options Options where the client config should be merged into.
     */
    static initializeClientConfig(options: ITDPOptions): Promise<ITDPOptions | null>;
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
