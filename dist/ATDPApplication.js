// TODO: Do we need a relative import?
import './webpack/_bootstrap';
import { merge } from 'lodash';
import { AppHeaderLink, AppHeader } from './components';
import { EditProvenanceGraphMenu } from './clue/utils/EditProvenanceGraphMenu';
import { DialogUtils } from './clue/base/dialogs';
import { EXTENSION_POINT_TDP_APP_EXTENSION } from './base/extensions';
import { TourManager } from './tour/TourManager';
import { TemporarySessionList, ButtonModeSelector, CLUEGraphManager } from './clue';
import { TDPTokenManager } from './auth';
import { ACLUEWrapper } from './clue/wrapper';
import { LoginMenu, loadClientConfig } from './base';
import { UserSession, PluginRegistry } from './app';
import { I18nextManager } from './i18n';
import { MixedStorageProvenanceGraphManager } from './clue/provenance';
import { VisLoader } from './clue/provvis';
/**
 * base class for TDP based applications
 */
export class ATDPApplication extends ACLUEWrapper {
    constructor(options = {}) {
        super();
        this.options = {
            loginForm: undefined,
            name: 'Target Discovery Platform',
            prefix: 'tdp',
            showCookieDisclaimer: false,
            showResearchDisclaimer: true,
            showAboutLink: true,
            showHelpLink: false,
            showTourLink: true,
            showOptionsLink: false,
            showReportBugLink: true,
            showProvenanceMenu: true,
            showClueModeButtons: true,
            enableProvenanceUrlTracking: true,
            cluePropertyHandler: 'hash',
            clueRewriteOtherProperty: false,
            clientConfig: null,
        };
        this.app = null;
        merge(this.options, options);
        this.initialize();
    }
    /**
     * Initialize async parts
     * TODO make public and remove call in constructor in the future
     */
    async initialize() {
        const configPromise = ATDPApplication.initializeClientConfig(this.options);
        const i18nPromise = I18nextManager.getInstance().initI18n();
        await Promise.all([configPromise, i18nPromise]);
        // Prefill the token manager with authorization configurations
        if (this.options.clientConfig?.tokenManager?.authorizationConfigurations) {
            await TDPTokenManager.addAuthorizationConfiguration(Object.entries(this.options.clientConfig.tokenManager.authorizationConfigurations).map(([id, config]) => ({ id, ...config })));
        }
        await this.build(document.body, { replaceBody: false });
        this.tourManager = new TourManager({
            doc: document,
            header: () => this.header,
            app: () => this.app,
        });
        if (this.options.showTourLink && this.tourManager.hasTours()) {
            const button = this.header.addRightMenu('<i class="fas fa-question-circle fa-fw"></i>', (evt) => {
                evt.preventDefault();
                return false;
            }, '#');
            button.dataset.bsToggle = 'modal';
            button.tabIndex = -1;
            button.dataset.bsTarget = `#${this.tourManager.chooser.id}`;
        }
    }
    /**
     * Loads the client configuration via `loadClientConfig` and automatically merges it into the options.
     * @param options Options where the client config should be merged into.
     */
    static async initializeClientConfig(options) {
        // If the clientConfig is falsy, assume no client configuration should be loaded.
        if (!options?.clientConfig) {
            return null;
        }
        // Otherwise, load and merge the configuration into the existing one.
        const parsedConfig = await loadClientConfig();
        options.clientConfig = merge(options?.clientConfig || {}, parsedConfig || {});
        return options;
    }
    createHeader(parent) {
        // create the common header
        const header = AppHeader.create(parent, {
            showCookieDisclaimer: this.options.showCookieDisclaimer,
            showAboutLink: this.options.showAboutLink,
            showHelpLink: this.options.showHelpLink,
            showReportBugLink: this.options.showReportBugLink,
            showOptionsLink: this.options.showOptionsLink,
            appLink: new AppHeaderLink(this.options.name, (event) => {
                event.preventDefault();
                this.fire(ATDPApplication.EVENT_OPEN_START_MENU);
                return false;
            }),
        });
        if (this.options.showResearchDisclaimer) {
            const aboutDialogBody = header.aboutDialog;
            if (typeof this.options.showResearchDisclaimer === 'function') {
                this.options.showResearchDisclaimer(aboutDialogBody);
            }
            else {
                aboutDialogBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.disclaimerMessage')}</span></div>`);
            }
        }
        return header;
    }
    buildImpl(body) {
        this.header = this.createHeader(body.querySelector('div.box'));
        this.on('jumped_to,loaded_graph', () => this.header.ready());
        // load all available provenance graphs
        const manager = new MixedStorageProvenanceGraphManager({
            prefix: this.options.prefix,
            storage: localStorage,
            application: this.options.prefix,
            ...(this.options.provenanceManagerOptions || {}),
        });
        this.cleanUpOld(manager);
        const clueManager = new CLUEGraphManager(manager, {
            isReadOnly: !this.options.enableProvenanceUrlTracking,
            propertyHandler: this.options.cluePropertyHandler,
            rewriteOtherProperty: this.options.clueRewriteOtherProperty,
        });
        this.header.wait();
        // trigger bootstrap loading
        import('jquery');
        this.loginMenu = new LoginMenu(this.header, {
            insertIntoHeader: true,
            loginForm: this.options.loginForm,
            watch: true,
        });
        this.loginMenu.on(LoginMenu.EVENT_LOGGED_OUT, () => {
            // reopen after logged out
            this.loginMenu.forceShowDialog();
        });
        let provenanceMenu;
        if (this.options.showProvenanceMenu) {
            provenanceMenu = new EditProvenanceGraphMenu(clueManager, this.header.rightMenu);
        }
        const main = document.body.querySelector('main');
        const content = body.querySelector('div.content');
        // wrapper around to better control when the graph will be resolved
        let graphResolver;
        const graph = new Promise((resolve, reject) => {
            graphResolver = resolve;
        });
        graph.catch((error) => {
            DialogUtils.showProveanceGraphNotFoundDialog(clueManager, error.graph);
        });
        graph.then((g) => {
            if (this.options.showClueModeButtons) {
                const phoveaNavbar = document.body.querySelector('.phovea-navbar');
                const modeSelector = phoveaNavbar.appendChild(document.createElement('header'));
                modeSelector.classList.add('collapsed');
                modeSelector.classList.add('clue-modeselector');
                ButtonModeSelector.createButton(modeSelector, {
                    size: 'sm',
                });
            }
            provenanceMenu?.setGraph(g);
        });
        const provVis = VisLoader.loadProvenanceGraphVis(graph, content, {
            thumbnails: false,
            provVisCollapsed: true,
            hideCLUEButtonsOnCollapse: true,
        });
        const storyVis = VisLoader.loadStoryVis(graph, content, main, {
            thumbnails: false,
        });
        this.app = graph.then((g) => this.createApp(g, clueManager, main));
        const initSession = () => {
            // logged in, so we can resolve the graph for real
            graphResolver(clueManager.chooseLazy(true));
            this.app.then((appInstance) => this.initSessionImpl(appInstance));
            this.customizeApp(content, main);
        };
        let forceShowLoginDialogTimeout = -1;
        // INITIAL LOGIC
        this.loginMenu.on(LoginMenu.EVENT_LOGGED_IN, () => {
            clearTimeout(forceShowLoginDialogTimeout);
            initSession();
        });
        if (!UserSession.getInstance().isLoggedIn()) {
            // wait 1sec before the showing the login dialog to give the auto login mechanism a chance
            forceShowLoginDialogTimeout = setTimeout(() => this.loginMenu.forceShowDialog(), 1000);
        }
        else {
            initSession();
        }
        return { graph, manager: clueManager, storyVis, provVis };
    }
    /**
     * customize the using extension point
     */
    customizeApp(content, main) {
        const plugins = PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_APP_EXTENSION);
        if (plugins.length === 0) {
            return;
        }
        this.app.then((app) => {
            Promise.all(plugins.map((d) => d.load())).then((ps) => {
                for (const plugin of ps) {
                    plugin.factory({
                        header: this.header,
                        content,
                        main,
                        app,
                    });
                }
            });
        });
    }
    cleanUpOld(manager) {
        const workspaces = manager.listLocalSync().sort((a, b) => -((a.ts || 0) - (b.ts || 0)));
        // cleanup up temporary ones
        if (workspaces.length > TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES) {
            const toDelete = workspaces.slice(TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
            Promise.all(toDelete.map((d) => manager.delete(d))).catch((error) => {
                console.warn('cannot delete old graphs:', error);
            });
        }
    }
}
ATDPApplication.EVENT_OPEN_START_MENU = 'openStartMenu';
//# sourceMappingURL=ATDPApplication.js.map