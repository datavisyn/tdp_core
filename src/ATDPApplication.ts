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
import 'phovea_ui/src/_font-awesome';

export {default as CLUEGraphManager} from 'phovea_clue/src/CLUEGraphManager';

export interface ITDPOptions {
  /**
   * alternative login formular
   */
  loginForm: string|undefined;
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
    showCookieDisclaimer: false
  };

  protected app: Promise<T> = null;
  protected header: AppHeader;

  constructor(options: Partial<ITDPOptions> = {}) {
    super();
    mixin(this.options, options);
    this.build(document.body, {replaceBody: false});
  }

  protected buildImpl(body: HTMLElement) {
    //create the common header
    const headerOptions = {
      showCookieDisclaimer: this.options.showCookieDisclaimer,
      showOptionsLink: true, // always activate options
      appLink: new AppHeaderLink(this.options.name, (event) => {
        event.preventDefault();
        this.fire(ATDPApplication.EVENT_OPEN_START_MENU);
        return false;
      })
    };
    this.header = createHeader(<HTMLElement>body.querySelector('div.box'), headerOptions);

    const aboutDialogBody = this.header.aboutDialog;
    aboutDialogBody.insertAdjacentHTML('afterbegin', '<div class="alert alert-warning" role="alert"><strong>Disclaimer</strong> This software is <strong>for research purpose only</strong>.</span></div>');

    this.on('jumped_to,loaded_graph', () => this.header.ready());
    //load all available provenance graphs
    const manager = new MixedStorageProvenanceGraphManager({
      prefix: this.options.prefix,
      storage: localStorage,
      application: this.options.prefix
    });
    const clueManager = new CLUEGraphManager(manager);

    this.header.wait();

    // trigger bootstrap loading
    lazyBootstrap();

    const loginMenu = new LoginMenu(this.header, {
      insertIntoHeader: true,
      loginForm: this.options.loginForm
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

    const provVis = loadProvenanceGraphVis(graph, body.querySelector('div.content'), {
      thumbnails: false,
        provVisCollapsed: true,
        hideCLUEButtonsOnCollapse: true
    });
    const storyVis = loadStoryVis(graph, <HTMLElement>body.querySelector('div.content'), main, {
      thumbnails: false
    });

    this.app = graph.then((graph) => this.createApp(graph, clueManager, main));

    const initSession = () => {
      //logged in, so we can resolve the graph for real
      graphResolver(clueManager.chooseLazy(true));

      this.app.then((appInstance) => this.initSessionImpl(appInstance));
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
