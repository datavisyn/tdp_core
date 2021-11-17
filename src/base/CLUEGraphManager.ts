import {WrapperUtils} from './WrapperUtils';
import {ResolveNow, HashProperties} from '../base';
import {EventHandler} from '../base/event';
import {AppContext, UserSession} from '../app';
import {I18nextManager} from '../i18n';
import {MixedStorageProvenanceGraphManager, IProvenanceGraphDataDescription, ProvenanceGraph} from '../provenance';

export interface IClueState {
  graph: string;
  slide: number;
  state: number;
}

export class CLUEGraphManager extends EventHandler {
  static readonly EVENT_EXTERNAL_STATE_CHANGE = 'externalStateChanged';

  /**
   * update hash in 100ms to prevent to frequent updates
   * @type {number}
   */
  static readonly DEBOUNCE_UPDATE_DELAY = 100;

  private onHashChanged = () => this.onHashChangedImpl();

  constructor(private manager: MixedStorageProvenanceGraphManager, private readonly isReadonly = false) {
    super();
    //selected by url
  }

  private static setGraphInUrl(value: string) {
    AppContext.getInstance().hash.removeProp('clue_slide', false);
    AppContext.getInstance().hash.removeProp('clue_state', false);
    AppContext.getInstance().hash.setProp('clue_graph', value);
  }

  static reloadPage() {
    window.location.reload();
  }

  private onHashChangedImpl() {
    const graph = AppContext.getInstance().hash.getProp('clue_graph');
    const slide = AppContext.getInstance().hash.getInt('clue_slide', null);
    const state = AppContext.getInstance().hash.getInt('clue_state', null);

    this.fire(CLUEGraphManager.EVENT_EXTERNAL_STATE_CHANGE, <IClueState>{graph, slide, state});
  }

  newRemoteGraph() {
    if (UserSession.getInstance().isLoggedIn()) {
      AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
      CLUEGraphManager.setGraphInUrl('new_remote');
      CLUEGraphManager.reloadPage();
    }
  }

  newGraph() {
    AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    CLUEGraphManager.setGraphInUrl('new');
    CLUEGraphManager.reloadPage();
  }

  loadGraph(desc: any) {
    // reset
    AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    CLUEGraphManager.setGraphInUrl(desc.id);
    CLUEGraphManager.reloadPage();
  }

  get storedSlide() {
    return AppContext.getInstance().hash.getInt('clue_slide', null);
  }

  set storedSlide(value: number) {
    if (this.isReadonly) {
      return;
    }
    AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    if (value !== null) {
      AppContext.getInstance().hash.setInt('clue_slide', value, CLUEGraphManager.DEBOUNCE_UPDATE_DELAY);
    } else {
      AppContext.getInstance().hash.removeProp('clue_slide');
    }
    AppContext.getInstance().hash.on(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
  }

  get storedState() {
    return AppContext.getInstance().hash.getInt('clue_state', null);
  }

  set storedState(value: number) {
    if (this.isReadonly) {
      return;
    }
    AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    if (value !== null) {
      AppContext.getInstance().hash.setInt('clue_state', value, CLUEGraphManager.DEBOUNCE_UPDATE_DELAY);
    } else {
      AppContext.getInstance().hash.removeProp('clue_state');
    }
    AppContext.getInstance().hash.on(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
  }

  get isAutoPlay() {
    return AppContext.getInstance().hash.has('clue_autoplay');
  }

  list() {
    return this.manager.list();
  }

  delete(graph: IProvenanceGraphDataDescription) {
    return this.manager.delete(graph);
  }

  startFromScratch() {
    AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    AppContext.getInstance().hash.removeProp('clue_slide', false);
    AppContext.getInstance().hash.removeProp('clue_state', false);
    AppContext.getInstance().hash.removeProp('clue_graph');
    window.location.reload();
  }

  importGraph(dump: any, remote = false) {
    (remote ? this.manager.importRemote(dump) : this.manager.importLocal(dump)).then((graph) => {
      this.loadGraph(graph.desc);
    });
  }

  importExistingGraph(graph: IProvenanceGraphDataDescription, extras: any = {}, cleanUpLocal = false) {
    return this.manager.cloneRemote(graph, extras).then((newGraph) => {
      const p = (graph.local && cleanUpLocal) ? this.manager.delete(graph) : ResolveNow.resolveImmediately(null);
      return p.then(() => this.loadGraph(newGraph.desc));
    });
  }

  migrateGraph(graph: ProvenanceGraph, extras: any = {}): PromiseLike<ProvenanceGraph> {
    const old = graph.desc;
    return this.manager.migrateRemote(graph, extras).then((newGraph) => {
      return (old.local ? this.manager.delete(old) : ResolveNow.resolveImmediately(true)).then(() => {
        if (!this.isReadonly) {
          AppContext.getInstance().hash.setProp('clue_graph', newGraph.desc.id); //just update the reference
        }
        return newGraph;
      });
    });
  }

  editGraphMetaData(graph: IProvenanceGraphDataDescription, extras: any = {}) {
    return this.manager.edit(graph, extras);
  }

  setGraph(graph: ProvenanceGraph) {
    if (this.isReadonly) {
      return graph;
    }
    AppContext.getInstance().hash.off(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    AppContext.getInstance().hash.setProp('clue_graph', graph.desc.id);
    AppContext.getInstance().hash.on(HashProperties.EVENT_HASH_CHANGED, this.onHashChanged);
    return graph;
  }

  private chooseNew() {
    const graph = AppContext.getInstance().hash.getProp('clue_graph', null);
    if (graph === 'memory') {
      return ResolveNow.resolveImmediately(this.manager.createInMemory());
    }
    if (graph === 'new_remote' && UserSession.getInstance().isLoggedIn()) {
      return this.manager.createRemote();
    }
    if (graph === null || graph === 'new') {
      if (WrapperUtils.useInMemoryGraph()) {
        return ResolveNow.resolveImmediately(this.manager.createInMemory());
      }
      return this.manager.createLocal();
    }
    return null;
  }

  private loadChosen(graph: string, desc?: IProvenanceGraphDataDescription, rejectOnNotFound: boolean = false) {
    if (desc) {
      if (WrapperUtils.useInMemoryGraph()) {
        return this.manager.cloneInMemory(desc);
      }
      if ((<any>desc).local || (UserSession.getInstance().isLoggedIn() && UserSession.getInstance().canWrite(desc))) {
        return this.manager.get(desc);
      }
      return this.manager.cloneLocal(desc);
    }
    // not found
    if (rejectOnNotFound) {
      return Promise.reject({graph, msg: I18nextManager.getInstance().i18n.t('phovea:clue.errorMessage', {graphID: graph})});
    }
    if (WrapperUtils.useInMemoryGraph()) {
      return ResolveNow.resolveImmediately(this.manager.createInMemory());
    }
    return this.manager.create();
  }

  private chooseImpl(list: IProvenanceGraphDataDescription[], rejectOnNotFound: boolean = false) {
    const r = this.chooseNew();
    if (r) {
      return r;
    }
    const graph = AppContext.getInstance().hash.getProp('clue_graph', null);
    const desc = <IProvenanceGraphDataDescription>list.find((d) => d.id === graph);
    return this.loadChosen(graph, desc, rejectOnNotFound);
  }

  private chooseLazyImpl(rejectOnNotFound: boolean = false) {
    const r = this.chooseNew();
    if (r) {
      return r;
    }
    const graph = AppContext.getInstance().hash.getProp('clue_graph', null);
    const locals = this.manager.listLocalSync();
    const desc = locals.find((d) => d.id === graph);
    if (desc) {
      return this.loadChosen(graph, desc, rejectOnNotFound);
    }
    // also check remote
    return this.manager.listRemote().then((remotes) => {
      const desc = remotes.find((d) => d.id === graph);
      return this.loadChosen(graph, desc, rejectOnNotFound);
    });
  }

  chooseLazy(rejectOnNotFound: boolean = false) {
    return this.chooseLazyImpl(rejectOnNotFound).then((g) => this.setGraph(g));
  }

  choose(list: IProvenanceGraphDataDescription[], rejectOnNotFound: boolean = false) {
    return this.chooseImpl(list, rejectOnNotFound).then((g) => this.setGraph(g));
  }

  loadOrClone(graph: IProvenanceGraphDataDescription, isSelect: boolean) {
    if (isSelect) {
      this.loadGraph(graph);
    } else {
      this.cloneLocal(graph);
    }
  }

  cloneLocal(graph: IProvenanceGraphDataDescription) {
    if (WrapperUtils.useInMemoryGraph()) {
      if (!this.isReadonly) {
        CLUEGraphManager.setGraphInUrl('memory');
      }
      return this.manager.cloneInMemory(graph);
    }
    this.manager.cloneLocal(graph).then((graph) => this.loadGraph(graph.desc));
  }

  /**
   * create the provenance graph selection dropdown and handles the graph selection
   * @param manager
   * @returns {Promise<U>}
   */
  static choose(manager: CLUEGraphManager): Promise<ProvenanceGraph> {
    return manager.list().then((list) => manager.choose(list));
  }
}
