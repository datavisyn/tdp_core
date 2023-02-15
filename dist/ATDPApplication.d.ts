import './webpack/_bootstrap';
import { ITDPClientConfig } from 'visyn_core/base';
import { AppHeader } from './components';
import { TourManager } from './tour/TourManager';
import { CLUEGraphManager } from './clue';
import { ACLUEWrapper } from './clue/wrapper';
import { LoginMenu } from './base';
import { IMixedStorageProvenanceGraphManagerOptions, ProvenanceGraph } from './clue/provenance';
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
     * Show/hide the `Exploration`, `Authoring`, `Presentation` buttons in the header
     * @default: true
     */
    showClueModeButtons: boolean;
    /**
     * @default true
     */
    enableProvenanceUrlTracking?: boolean;
    /**
     * The CLUE parameters can be encoded in the hash '#clue_graph=...' (value: 'hash')
     * or as query parameters `?clue_graph=...` (value: 'query') in the URL.
     *
     * @related clueRewriteOtherProperty
     * @default hash
     */
    cluePropertyHandler?: 'hash' | 'query';
    /**
     * If set to `true` it will rewrite incoming URLs of the property handler that is not selected.
     *
     * - With `cluePropertyHandler: 'hash'` it rewrites URLs with `?clue_graph=...` to `#clue_graph=...`
     * - With `cluePropertyHandler: 'query'` it rewrites URLs with `#clue_graph=...` to `?clue_graph=...`
     *
     * If this flag is set to `false` the rewrite is disabled.
     *
     * @related cluePropertyHandler
     * @default false
     */
    clueRewriteOtherProperty?: boolean;
    /**
     * options passed to the IProvenanceGraphManager
     */
    provenanceManagerOptions?: IMixedStorageProvenanceGraphManagerOptions;
    /**
     * Client configuration which is automatically populated by the '/clientConfig.json' on initialize.
     * To enable the asynchronous loading of the client configuration, pass an object (optionally with default values).
     * Passing falsy values disables the client configuration load.
     */
    clientConfig?: ITDPClientConfig | null | undefined;
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
     * Loads the client configuration via `loadClientConfig` and automatically merges it into the options.
     * @param options Options where the client config should be merged into.
     */
    static initializeClientConfig(options: ITDPOptions): Promise<ITDPOptions | null>;
    protected createHeader(parent: HTMLElement): AppHeader;
    protected buildImpl(body: HTMLElement): {
        graph: Promise<ProvenanceGraph>;
        manager: CLUEGraphManager;
        storyVis: () => Promise<import("./clue").VerticalStoryVis>;
        provVis: () => Promise<import("./clue").LayoutedProvVis>;
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
//# sourceMappingURL=ATDPApplication.d.ts.map