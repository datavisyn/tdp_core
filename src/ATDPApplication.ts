/**
 * Created by sam on 03.03.2017.
 */

import ProvenanceGraph from 'phovea_core/src/provenance/ProvenanceGraph';
import {create as createHeader, AppHeaderLink, AppHeader} from 'phovea_ui/src/header';
import {MixedStorageProvenanceGraphManager} from 'phovea_core/src/provenance';
import CLUEGraphManager from 'phovea_clue/src/CLUEGraphManager';
import * as cmode from 'phovea_clue/src/mode';
import LoginMenu from 'phovea_clue/src/menu/LoginMenu';
import {isLoggedIn} from 'phovea_core/src/security';
import ACLUEWrapper from 'phovea_clue/src/ACLUEWrapper';
import {loadProvenanceGraphVis, loadStoryVis} from 'phovea_clue/src/vis_loader';
import EditProvenanceGraphMenu from './internal/EditProvenanceGraphMenu';
import {showProveanceGraphNotFoundDialog} from './dialogs';
import {mixin} from 'phovea_core/src';
import lazyBootstrap from 'phovea_ui/src/_lazyBootstrap';
import {KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES} from './constants';
import 'phovea_ui/src/_font-awesome';
import {list as listPlugins} from 'phovea_core/src/plugin';
import {EXTENSION_POINT_TDP_APP_EXTENSION, IAppExtensionExtension} from './extensions';

export {default as CLUEGraphManager} from 'phovea_clue/src/CLUEGraphManager';

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
    enableProvenanceUrlTracking: true
  };

  protected app: Promise<T> = null;
  protected header: AppHeader;

  constructor(options: Partial<ITDPOptions> = {}) {
    super();
    mixin(this.options, options);
    this.build(document.body, {replaceBody: false});
  }

  protected createHeader(parent: HTMLElement) {
    //create the common header
    const header = createHeader(parent, {
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
        aboutDialogBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-warning" role="alert"><strong>Disclaimer</strong> This software is <strong>for research purpose only</strong>.</span></div>');
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
      application: this.options.prefix
    });

    this.cleanUpOld(manager);

    const clueManager = new CLUEGraphManager(manager, !this.options.enableProvenanceUrlTracking);

    this.header.wait();

    // trigger bootstrap loading
    lazyBootstrap();

    const loginMenu = new LoginMenu(this.header, {
      insertIntoHeader: true,
      loginForm: this.options.loginForm,
      watch: true
    });
    loginMenu.on(LoginMenu.EVENT_LOGGED_OUT, () => {
      // reopen after logged out
      loginMenu.forceShowDialog();
    });

    const provenanceMenu = new EditProvenanceGraphMenu(clueManager, this.header.rightMenu);

    const modeSelector = body.querySelector('header');
    modeSelector.classList.add('collapsed');
    modeSelector.classList.add('clue-modeselector');


    const main = <HTMLElement>document.body.querySelector('main');
    const content = <HTMLElement>body.querySelector('div.content');

    //wrapper around to better control when the graph will be resolved
    let graphResolver: (graph: PromiseLike<ProvenanceGraph>) => void;
    const graph = new Promise<ProvenanceGraph>((resolve, reject) => graphResolver = resolve);

    graph.catch((error: { graph: string }) => {
      showProveanceGraphNotFoundDialog(clueManager, error.graph);
    });

    graph.then((graph) => {
      cmode.createButton(modeSelector, {
        size: 'sm'
      });
      provenanceMenu.setGraph(graph);
    });

    const provVis = loadProvenanceGraphVis(graph, content, {
      thumbnails: false,
      provVisCollapsed: true,
      hideCLUEButtonsOnCollapse: true
    });
    const storyVis = loadStoryVis(graph, content, main, {
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
    loginMenu.on(LoginMenu.EVENT_LOGGED_IN, () => {
      clearTimeout(forceShowLoginDialogTimeout);
      initSession();
    });
    if (!isLoggedIn()) {
      //wait 1sec before the showing the login dialog to give the auto login mechanism a chance
      forceShowLoginDialogTimeout = setTimeout(() => loginMenu.forceShowDialog(), 1000);
    } else {
      initSession();
    }

    return {graph, manager: clueManager, storyVis, provVis};
  }

  /**
   * customize the using extension point
   */
  private customizeApp(content: HTMLElement, main: HTMLElement) {
    const plugins = listPlugins(EXTENSION_POINT_TDP_APP_EXTENSION);
    if (plugins.length === 0) {
      return;
    }
    Promise.all([<any>this.app, ...plugins.map((d) => d.load())]).then((args) => {
      const appInstance = args[0];
      const plugins: IAppExtensionExtension[] = args.slice(1);

      for (const plugin of plugins) {
        plugin.factory({
          header: this.header,
          content,
          main,
          app: appInstance
        });
      }
    });
  }

  private cleanUpOld(manager: MixedStorageProvenanceGraphManager) {
    const workspaces = manager.listLocalSync().sort((a, b) => -((a.ts || 0) - (b.ts || 0)));
    // cleanup up temporary ones
    if (workspaces.length > KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES) {
      const toDelete = workspaces.slice(KEEP_ONLY_LAST_X_TEMPORARY_WORKSPACES);
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

export default ATDPApplication;
