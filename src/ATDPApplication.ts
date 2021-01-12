/**
 * Created by sam on 03.03.2017.
 */

import {ProvenanceGraph, MixedStorageProvenanceGraphManager, UserSession, BaseUtils, I18nextManager, PluginRegistry, IMixedStorageProvenanceGraphManagerOptions, Ajax} from 'phovea_core';
import {AppHeaderLink, AppHeader} from 'phovea_ui';
import 'phovea_ui/dist/webpack/_bootstrap';
import {CLUEGraphManager, LoginMenu, ButtonModeSelector, ACLUEWrapper, VisLoader} from 'phovea_clue';
import {EditProvenanceGraphMenu} from './utils/EditProvenanceGraphMenu';
import {DialogUtils} from './base/dialogs';
import {EXTENSION_POINT_TDP_APP_EXTENSION} from './base/extensions';
import {IAppExtensionExtension} from './base/interfaces';
import {TourManager} from './tour/TourManager';
import {TemporarySessionList} from './utils/SessionList';
import {isEmpty} from 'lodash';


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
   */
  clientConfig?: any;
}

/**
 * base class for TDP based applications
 */
export abstract class ATDPApplication<T> extends ACLUEWrapper {
  static readonly EVENT_OPEN_START_MENU = 'openStartMenu';

  protected readonly options: ITDPOptions = {
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
    clientConfig: {}
  };

  protected app: Promise<T> = null;
  protected header: AppHeader;
  protected loginMenu: LoginMenu;
  protected tourManager: TourManager;

  constructor(options: Partial<ITDPOptions> = {}) {
    super();

    BaseUtils.mixin(this.options, options);

    const configPromise = ATDPApplication.initializeClientConfig(this.options);

    const i18nPromise = I18nextManager.getInstance().initI18n();

    Promise.all([configPromise, i18nPromise]).then(() => {
      this.tourManager = new TourManager({
        doc: document,
        header: () => this.header,
        app: () => this.app
      });

      BaseUtils.mixin(this.options, {
        showHelpLink: this.tourManager.hasTours() ? '#' : false // use help button for tours
      });

      this.build(document.body, {replaceBody: false});

      if (this.tourManager.hasTours()) {
        const button = document.querySelector<HTMLElement>('[data-header="helpLink"] a');

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
  public static loadClientConfig<T = any>(): Promise<T | null> {
    return Ajax.getJSON('/clientConfig.json').catch((e) => {
      console.error('Error parsing clientConfig.json', e);
      return null;
    });
  }

  /**
   * Loads the client config via `loadClientConfig` and automatically merges it into the options.
   * @param options Options where the client config should be merged into.
   */
  public static initializeClientConfig(options: ITDPOptions): Promise<ITDPOptions> {
    if(isEmpty(options.clientConfig)) {
      return Promise.resolve(options);
    }
    return ATDPApplication.loadClientConfig().then((parsedConfig) => {
      options.clientConfig = BaseUtils.mixin(options?.clientConfig || {}, parsedConfig || {});
      return options;
    });
  }

  protected createHeader(parent: HTMLElement) {
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
      } else {
        aboutDialogBody.insertAdjacentHTML('afterbegin', `<div class="alert alert-warning" role="alert">${I18nextManager.getInstance().i18n.t('tdp:core.disclaimerMessage')}</span></div>`);
      }
    }

    return header;
  }

  protected buildImpl(body: HTMLElement) {
    this.header = this.createHeader(<HTMLElement>body.querySelector('div.box'));

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
    let provenanceMenu: EditProvenanceGraphMenu | null;

    if (this.options.showProvenanceMenu) {
      provenanceMenu = new EditProvenanceGraphMenu(clueManager, this.header.rightMenu);
    }

    const modeSelector = body.querySelector('header');
    modeSelector.classList.add('collapsed');
    modeSelector.classList.add('clue-modeselector');


    const main = <HTMLElement>document.body.querySelector('main');
    const content = <HTMLElement>body.querySelector('div.content');

    //wrapper around to better control when the graph will be resolved
    let graphResolver: (graph: PromiseLike<ProvenanceGraph>) => void;
    const graph = new Promise<ProvenanceGraph>((resolve, reject) => graphResolver = resolve);

    graph.catch((error: {graph: string}) => {
      DialogUtils.showProveanceGraphNotFoundDialog(clueManager, error.graph);
    });

    graph.then((graph) => {
      ButtonModeSelector.createButton(modeSelector, {
        size: 'sm'
      });
      provenanceMenu?.setGraph(graph);
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

    let forceShowLoginDialogTimeout: any = -1;
    // INITIAL LOGIC
    this.loginMenu.on(LoginMenu.EVENT_LOGGED_IN, () => {
      clearTimeout(forceShowLoginDialogTimeout);
      initSession();
    });
    if (!UserSession.getInstance().isLoggedIn()) {
      //wait 1sec before the showing the login dialog to give the auto login mechanism a chance
      forceShowLoginDialogTimeout = setTimeout(() => this.loginMenu.forceShowDialog(), 1000);
    } else {
      initSession();
    }

    return {graph, manager: clueManager, storyVis, provVis};
  }

  /**
   * customize the using extension point
   */
  private customizeApp(content: HTMLElement, main: HTMLElement) {
    const plugins = PluginRegistry.getInstance().listPlugins(EXTENSION_POINT_TDP_APP_EXTENSION);
    if (plugins.length === 0) {
      return;
    }
    this.app.then((app) => {
      Promise.all(plugins.map((d) => d.load())).then((plugins: IAppExtensionExtension[]) => {
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

  private cleanUpOld(manager: MixedStorageProvenanceGraphManager) {
    const workspaces = manager.listLocalSync().sort((a, b) => -((a.ts || 0) - (b.ts || 0)));
    // cleanup up temporary ones
    if (workspaces.length > TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES) {
      const toDelete = workspaces.slice(TemporarySessionList.KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
      Promise.all(toDelete.map((d) => manager.delete(d))).catch((error) => {
        console.warn('cannot delete old graphs:', error);
      });
    }
  }

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
  protected abstract initSessionImpl(app: T);
}
