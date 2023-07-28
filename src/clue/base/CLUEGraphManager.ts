import { I18nextManager } from 'visyn_core/i18n';
import { EventHandler } from 'visyn_core/base';
import { UserSession } from 'visyn_core/security';
import { IProvenanceGraphDataDescription, IProvenanceGraphDump, ProvenanceGraph } from '../provenance';
import type { MixedStorageProvenanceGraphManager } from '../provenance/MixedStorageProvenanceGraphManager';
import { CommonPropertyHandler, HashPropertyHandler, QueryPropertyHandler } from '../../base/url';

export interface IClueState {
  graph: string;
  slide: number;
  state: number;
}

interface ICLUEGraphManagerOptions {
  /**
   * Is this graph manager read-only mode?
   * @default false
   */
  isReadOnly?: boolean;

  /**
   * The CLUE parameters can be encoded in the hash '#clue_graph=...' (value: 'hash')
   * or as query parameters `?clue_graph=...` (value: 'query') in the URL.
   *
   * @default hash
   */
  propertyHandler?: 'query' | 'hash';

  /**
   * If set to `true` it will rewrite incoming URLs of the property handler that is not selected.
   *
   * - With `cluePropertyHandler: 'hash'` it rewrites URLs with `?clue_graph=...` to `#clue_graph=...`
   * - With `cluePropertyHandler: 'query'` it rewrites URLs with `#clue_graph=...` to `?clue_graph=...`
   *
   * If this flag is set to `false` the rewrite is disabled.
   *
   * @default false
   */
  rewriteOtherProperty?: boolean;
}

/**
 * Based on the selected property the other property handler is checked for CLUE parameter.
 * Found parameters are then moved to the selected property.
 *
 * - With `selectedProperty = 'hash'` it rewrites URLs from `?clue_graph=...` to `#clue_graph=...`
 * - With `selectedProperty = 'query'` it rewrites URLs from `#clue_graph=...` to `?clue_graph=...`
 *
 * If no CLUE parameters are found in the other property, no action is done.
 *
 * The remaining parameters in hash and query are untouched.
 *
 * @internal
 * @param selectedProperty Selected property handler ('hash' or 'query')
 * @returns void
 */
export function rewriteURLOtherProperty(selectedProperty: 'hash' | 'query'): void {
  const fromHandler = selectedProperty === 'query' ? new HashPropertyHandler() : new QueryPropertyHandler();
  const toHandler = selectedProperty === 'query' ? new QueryPropertyHandler() : new HashPropertyHandler();

  const rewriteProperties = ['clue_graph', 'clue_state', 'clue_slide'];
  const foundProperties = rewriteProperties.some((property) => fromHandler.has(property));

  // no properties found to rewrite -> exit
  if (!foundProperties) {
    fromHandler.destroy();
    toHandler.destroy();
    return;
  }

  rewriteProperties
    .filter((property) => fromHandler.has(property))
    .forEach((property) => {
      toHandler.setProp(property, fromHandler.getProp(property), false); // false = disable immediate update -> update once at the end
      fromHandler.removeProp(property, false); // false = disable immediate update -> update once at the end
    });

  // get URL before destroying the handler + order handler so that query is always before hash
  const url = selectedProperty === 'query' ? toHandler.toURLString() + fromHandler.toURLString() : fromHandler.toURLString() + toHandler.toURLString();

  // remove possible event listener before pushing the new history state
  fromHandler.destroy();
  toHandler.destroy();

  window.history.pushState(null, `State ${Date.now()}`, url);
}

export class CLUEGraphManager extends EventHandler {
  static readonly EVENT_EXTERNAL_STATE_CHANGE = 'externalStateChanged';

  /**
   * update hash in 100ms to prevent to frequent updates
   * @type {number}
   */
  private static readonly DEBOUNCE_UPDATE_DELAY = 100;

  /**
   * Property handler to manipulate the hash or search query of the URL
   */
  private readonly propertyHandler: CommonPropertyHandler;

  /**
   * Is this graph manager read-only mode?
   */
  private isReadOnly = false;

  private onHashChanged = () => this.onHashChangedImpl();

  constructor(
    private manager: MixedStorageProvenanceGraphManager,
    { isReadOnly = false, propertyHandler = 'hash', rewriteOtherProperty = false }: ICLUEGraphManagerOptions = {
      isReadOnly: false,
      propertyHandler: 'hash',
      rewriteOtherProperty: false,
    },
  ) {
    super();

    this.isReadOnly = isReadOnly;

    // rewrite before initializing the property handler
    if (rewriteOtherProperty) {
      rewriteURLOtherProperty(propertyHandler);
    }

    this.propertyHandler = propertyHandler === 'query' ? new QueryPropertyHandler() : new HashPropertyHandler();
  }

  private setGraphInUrl(value: string) {
    this.propertyHandler.removeProp('clue_slide', false);
    this.propertyHandler.removeProp('clue_state', false);
    this.propertyHandler.setProp('clue_graph', value);
  }

  static reloadPage() {
    window.location.reload();
  }

  private onHashChangedImpl() {
    const graph = this.propertyHandler.getProp('clue_graph');
    const slide = this.propertyHandler.getInt('clue_slide', null);
    const state = this.propertyHandler.getInt('clue_state', null);

    this.fire(CLUEGraphManager.EVENT_EXTERNAL_STATE_CHANGE, <IClueState>{ graph, slide, state });
  }

  /**
   * Returns the URL only with `clue_graph` and `clue_state` in the hash or query.
   */
  getCLUEGraphURL(): string {
    return window.location.href.replace(this.propertyHandler.propertySource, this.propertyHandler.toURLString());
  }

  newRemoteGraph() {
    if (UserSession.getInstance().isLoggedIn()) {
      this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
      this.setGraphInUrl('new_remote');
      CLUEGraphManager.reloadPage();
    }
  }

  newGraph() {
    this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    this.setGraphInUrl('new');
    CLUEGraphManager.reloadPage();
  }

  loadGraph(desc: any) {
    // reset
    this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    this.setGraphInUrl(desc.id);
    CLUEGraphManager.reloadPage();
  }

  get storedSlide() {
    return this.propertyHandler.getInt('clue_slide', null);
  }

  set storedSlide(value: number) {
    if (this.isReadOnly) {
      return;
    }
    this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    if (value !== null) {
      this.propertyHandler.setInt('clue_slide', value, CLUEGraphManager.DEBOUNCE_UPDATE_DELAY);
    } else {
      this.propertyHandler.removeProp('clue_slide');
    }
    this.propertyHandler.on(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
  }

  get storedState() {
    return this.propertyHandler.getInt('clue_state', null);
  }

  set storedState(value: number) {
    if (this.isReadOnly) {
      return;
    }
    this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    if (value !== null) {
      this.propertyHandler.setInt('clue_state', value, CLUEGraphManager.DEBOUNCE_UPDATE_DELAY);
    } else {
      this.propertyHandler.removeProp('clue_state');
    }
    this.propertyHandler.on(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
  }

  get isAutoPlay() {
    return this.propertyHandler.has('clue_autoplay');
  }

  list() {
    return this.manager.list();
  }

  delete(graph: IProvenanceGraphDataDescription) {
    return this.manager.delete(graph);
  }

  startFromScratch() {
    this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    this.propertyHandler.removeProp('clue_slide', false);
    this.propertyHandler.removeProp('clue_state', false);
    this.propertyHandler.removeProp('clue_graph');
    window.location.reload();
  }

  /**
   * Import a provenance graph dump locally or remotely. After importing the graph the page reloads with the graph id in the URL.
   * @param dump Dump of the provenance graph
   * @param remote Import the dump remote or local
   * @param descOverrides Object with key value to override the desc of the provenance graph (use with caution)
   */
  async importGraph(dump: IProvenanceGraphDump, remote = false, descOverrides?: any) {
    const graph = await (remote ? this.manager.importRemote(dump, descOverrides) : this.manager.importLocal(dump, descOverrides));
    this.loadGraph(graph.desc);
  }

  importExistingGraph(graph: IProvenanceGraphDataDescription, extras: any = {}, cleanUpLocal = false) {
    return this.manager.cloneRemote(graph, extras).then((newGraph) => {
      const p = graph.local && cleanUpLocal ? this.manager.delete(graph) : Promise.resolve(null);
      return p.then(() => this.loadGraph(newGraph.desc));
    });
  }

  async migrateGraph(graph: ProvenanceGraph, extras: any = {}): Promise<ProvenanceGraph> {
    const old = graph.desc;
    const newGraph = await this.manager.migrateRemote(graph, extras);
    if (old.local) {
      await this.manager.delete(old);
    }
    if (!this.isReadOnly) {
      this.propertyHandler.setProp('clue_graph', newGraph.desc.id); // just update the reference
    }
    return newGraph;
  }

  editGraphMetaData(graph: IProvenanceGraphDataDescription, extras: any = {}) {
    return this.manager.edit(graph, extras);
  }

  setGraph(graph: ProvenanceGraph) {
    if (this.isReadOnly) {
      return graph;
    }
    this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    this.propertyHandler.setProp('clue_graph', graph.desc.id);
    this.propertyHandler.on(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    return graph;
  }

  private chooseNew() {
    const graph = this.propertyHandler.getProp('clue_graph', null);
    if (graph === 'memory') {
      return Promise.resolve(this.manager.createInMemory());
    }
    if (graph === 'new_remote' && UserSession.getInstance().isLoggedIn()) {
      return this.manager.createRemote();
    }
    if (graph === null || graph === 'new') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (this.useInMemoryGraph()) {
        return Promise.resolve(this.manager.createInMemory());
      }
      return this.manager.createLocal();
    }
    return null;
  }

  private loadChosen(graph: string, desc?: IProvenanceGraphDataDescription, rejectOnNotFound = false) {
    if (desc) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      if (this.useInMemoryGraph()) {
        return this.manager.cloneInMemory(desc);
      }
      if ((<any>desc).local || (UserSession.getInstance().isLoggedIn() && UserSession.getInstance().canWrite(desc))) {
        return this.manager.get(desc);
      }
      return this.manager.cloneLocal(desc);
    }
    // not found
    if (rejectOnNotFound) {
      return Promise.reject({ graph, msg: I18nextManager.getInstance().i18n.t('phovea:clue.errorMessage', { graphID: graph }) });
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (this.useInMemoryGraph()) {
      return Promise.resolve(this.manager.createInMemory());
    }
    return this.manager.create();
  }

  private chooseImpl(list: IProvenanceGraphDataDescription[], rejectOnNotFound = false) {
    const r = this.chooseNew();
    if (r) {
      return r;
    }
    const graph = this.propertyHandler.getProp('clue_graph', null);
    const desc = <IProvenanceGraphDataDescription>list.find((d) => d.id === graph);
    return this.loadChosen(graph, desc, rejectOnNotFound);
  }

  private chooseLazyImpl(rejectOnNotFound = false) {
    const r = this.chooseNew();
    if (r) {
      return r;
    }
    const graph = this.propertyHandler.getProp('clue_graph', null);
    const locals = this.manager.listLocalSync();
    const desc = locals.find((d) => d.id === graph);
    if (desc) {
      return this.loadChosen(graph, desc, rejectOnNotFound);
    }
    // also check remote
    return this.manager.listRemote().then((remotes) => {
      const d = remotes.find((rem) => rem.id === graph);
      return this.loadChosen(graph, d, rejectOnNotFound);
    });
  }

  chooseLazy(rejectOnNotFound = false) {
    return this.chooseLazyImpl(rejectOnNotFound).then((g) => this.setGraph(g));
  }

  choose(list: IProvenanceGraphDataDescription[], rejectOnNotFound = false) {
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (this.useInMemoryGraph()) {
      if (!this.isReadOnly) {
        this.setGraphInUrl('memory');
      }
      return this.manager.cloneInMemory(graph);
    }
    return this.manager.cloneLocal(graph).then((g) => this.loadGraph(g.desc));
  }

  private useInMemoryGraph() {
    return this.propertyHandler.has('clue_headless') || this.propertyHandler.getProp('clue_graph', '') === 'memory';
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
