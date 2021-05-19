/**
 * Created by sam on 03.03.2017.
 */
import { MixedStorageProvenanceGraphManager, UserSession, BaseUtils, I18nextManager, PluginRegistry, Ajax } from 'phovea_core';
import { AppHeaderLink, AppHeader } from 'phovea_ui';
import 'phovea_ui/dist/webpack/_bootstrap';
import { CLUEGraphManager, LoginMenu, ButtonModeSelector, ACLUEWrapper, VisLoader } from 'phovea_clue';
import { EditProvenanceGraphMenu } from './utils/EditProvenanceGraphMenu';
import { DialogUtils } from './base/dialogs';
import { EXTENSION_POINT_TDP_APP_EXTENSION } from './base/extensions';
import { TourManager } from './tour/TourManager';
import { TemporarySessionList } from './utils/SessionList';
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
            showOptionsLink: false,
            showReportBugLink: true,
            showProvenanceMenu: true,
            enableProvenanceUrlTracking: true,
            clientConfig: null
        };
        this.app = null;
        BaseUtils.mixin(this.options, options);
        const configPromise = ATDPApplication.initializeClientConfig(this.options);
        const i18nPromise = I18nextManager.getInstance().initI18n();
        Promise.all([configPromise, i18nPromise]).then(() => {
            this.tourManager = new TourManager({
                doc: document,
                header: () => this.header,
                app: () => this.app
            });
            // use help button for tours when not explicitly disabled by the `options` of the app customization
            const reuseHelpLinkForToursModal = (options.showHelpLink !== false && this.tourManager.hasTours());
            BaseUtils.mixin(this.options, {
                showHelpLink: reuseHelpLinkForToursModal ? '#' : false
            });
            this.build(document.body, { replaceBody: false });
            if (reuseHelpLinkForToursModal) {
                const button = document.querySelector('[data-header="helpLink"] a');
                button.dataset.toggle = 'modal';
                button.tabIndex = -1;
                button.dataset.target = `#${this.tourManager.chooser.id}`;
                button.onclick = (evt) => {
                    evt.preventDefault();
                };
            }
        });
    }
    /**
     * Loads the client config from '/clientConfig.json' and parses it.
     */
    static async loadClientConfig() {
        return Ajax.getJSON('/clientConfig.json').catch((e) => {
            console.error('Error parsing clientConfig.json', e);
            return null;
        });
    }
    /**
     * Loads the client configuration via `loadClientConfig` and automatically merges it into the options.
     * @param options Options where the client config should be merged into.
     */
    static async initializeClientConfig(options) {
        // If the clientConfig is falsy, assume no client configuration should be loaded.
        if (!(options === null || options === void 0 ? void 0 : options.clientConfig)) {
            return null;
        }
        // Otherwise, load and merge the configuration into the existing one.
        const parsedConfig = await ATDPApplication.loadClientConfig();
        options.clientConfig = BaseUtils.mixin((options === null || options === void 0 ? void 0 : options.clientConfig) || {}, parsedConfig || {});
        return options;
    }
    createHeader(parent) {
        //create the common header
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
            })
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
        //load all available provenance graphs
        const manager = new MixedStorageProvenanceGraphManager({
            prefix: this.options.prefix,
            storage: localStorage,
            application: this.options.prefix,
            ...(this.options.provenanceManagerOptions || {})
        });
        this.cleanUpOld(manager);
        const clueManager = new CLUEGraphManager(manager, !this.options.enableProvenanceUrlTracking);
        this.header.wait();
        // trigger bootstrap loading
        import('jquery');
        this.loginMenu = new LoginMenu(this.header, {
            insertIntoHeader: true,
            loginForm: this.options.loginForm,
            watch: true
        });
        this.loginMenu.on(LoginMenu.EVENT_LOGGED_OUT, () => {
            // reopen after logged out
            this.loginMenu.forceShowDialog();
        });
        let provenanceMenu;
        if (this.options.showProvenanceMenu) {
            provenanceMenu = new EditProvenanceGraphMenu(clueManager, this.header.rightMenu);
        }
        const modeSelector = body.querySelector('header');
        modeSelector.classList.add('collapsed');
        modeSelector.classList.add('clue-modeselector');
        const main = document.body.querySelector('main');
        const content = body.querySelector('div.content');
        //wrapper around to better control when the graph will be resolved
        let graphResolver;
        const graph = new Promise((resolve, reject) => graphResolver = resolve);
        graph.catch((error) => {
            DialogUtils.showProveanceGraphNotFoundDialog(clueManager, error.graph);
        });
        graph.then((graph) => {
            ButtonModeSelector.createButton(modeSelector, {
                size: 'sm'
            });
            provenanceMenu === null || provenanceMenu === void 0 ? void 0 : provenanceMenu.setGraph(graph);
        });
        const provVis = VisLoader.loadProvenanceGraphVis(graph, content, {
            thumbnails: false,
            provVisCollapsed: true,
            hideCLUEButtonsOnCollapse: true
        });
        const storyVis = VisLoader.loadStoryVis(graph, content, main, {
            thumbnails: false
        });
        this.app = graph.then((graph) => this.createApp(graph, clueManager, main));
        const initSession = () => {
            //logged in, so we can resolve the graph for real
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
            //wait 1sec before the showing the login dialog to give the auto login mechanism a chance
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
            Promise.all(plugins.map((d) => d.load())).then((plugins) => {
                for (const plugin of plugins) {
                    plugin.factory({
                        header: this.header,
                        content,
                        main,
                        app
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