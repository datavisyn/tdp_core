import { EventHandler } from '../../base/event';
import { UserSession } from '../../app';
import { I18nextManager } from '../../i18n';
import { CommonPropertyHandler, HashPropertyHandler, QueryPropertyHandler } from '../../base/url';
export class CLUEGraphManager extends EventHandler {
    constructor(manager, { isReadOnly = false, propertyHandler = 'hash' } = {
        isReadOnly: false,
        propertyHandler: 'hash',
    }) {
        super();
        this.manager = manager;
        /**
         * Property handler to manipulate the hash or search query of the URL
         */
        this.propertyHandler = null;
        /**
         * Is this graph manager read-only mode?
         */
        this.isReadOnly = false;
        this.onHashChanged = () => this.onHashChangedImpl();
        this.isReadOnly = isReadOnly;
        this.propertyHandler = propertyHandler === 'query' ? new QueryPropertyHandler() : new HashPropertyHandler();
        // selected by url
    }
    setGraphInUrl(value) {
        this.propertyHandler.removeProp('clue_slide', false);
        this.propertyHandler.removeProp('clue_state', false);
        this.propertyHandler.setProp('clue_graph', value);
    }
    static reloadPage() {
        window.location.reload();
    }
    onHashChangedImpl() {
        const graph = this.propertyHandler.getProp('clue_graph');
        const slide = this.propertyHandler.getInt('clue_slide', null);
        const state = this.propertyHandler.getInt('clue_state', null);
        this.fire(CLUEGraphManager.EVENT_EXTERNAL_STATE_CHANGE, { graph, slide, state });
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
    loadGraph(desc) {
        // reset
        this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
        this.setGraphInUrl(desc.id);
        CLUEGraphManager.reloadPage();
    }
    get storedSlide() {
        return this.propertyHandler.getInt('clue_slide', null);
    }
    set storedSlide(value) {
        if (this.isReadOnly) {
            return;
        }
        this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
        if (value !== null) {
            this.propertyHandler.setInt('clue_slide', value, CLUEGraphManager.DEBOUNCE_UPDATE_DELAY);
        }
        else {
            this.propertyHandler.removeProp('clue_slide');
        }
        this.propertyHandler.on(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
    }
    get storedState() {
        return this.propertyHandler.getInt('clue_state', null);
    }
    set storedState(value) {
        if (this.isReadOnly) {
            return;
        }
        this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
        if (value !== null) {
            this.propertyHandler.setInt('clue_state', value, CLUEGraphManager.DEBOUNCE_UPDATE_DELAY);
        }
        else {
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
    delete(graph) {
        return this.manager.delete(graph);
    }
    startFromScratch() {
        this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
        this.propertyHandler.removeProp('clue_slide', false);
        this.propertyHandler.removeProp('clue_state', false);
        this.propertyHandler.removeProp('clue_graph');
        window.location.reload();
    }
    importGraph(dump, remote = false) {
        (remote ? this.manager.importRemote(dump) : this.manager.importLocal(dump)).then((graph) => {
            this.loadGraph(graph.desc);
        });
    }
    importExistingGraph(graph, extras = {}, cleanUpLocal = false) {
        return this.manager.cloneRemote(graph, extras).then((newGraph) => {
            const p = graph.local && cleanUpLocal ? this.manager.delete(graph) : Promise.resolve(null);
            return p.then(() => this.loadGraph(newGraph.desc));
        });
    }
    migrateGraph(graph, extras = {}) {
        const old = graph.desc;
        return this.manager.migrateRemote(graph, extras).then((newGraph) => {
            return (old.local ? this.manager.delete(old) : Promise.resolve(true)).then(() => {
                if (!this.isReadOnly) {
                    this.propertyHandler.setProp('clue_graph', newGraph.desc.id); // just update the reference
                }
                return newGraph;
            });
        });
    }
    editGraphMetaData(graph, extras = {}) {
        return this.manager.edit(graph, extras);
    }
    setGraph(graph) {
        if (this.isReadOnly) {
            return graph;
        }
        this.propertyHandler.off(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
        this.propertyHandler.setProp('clue_graph', graph.desc.id);
        this.propertyHandler.on(CommonPropertyHandler.EVENT_HASH_CHANGED, this.onHashChanged);
        return graph;
    }
    chooseNew() {
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
    loadChosen(graph, desc, rejectOnNotFound = false) {
        if (desc) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            if (this.useInMemoryGraph()) {
                return this.manager.cloneInMemory(desc);
            }
            if (desc.local || (UserSession.getInstance().isLoggedIn() && UserSession.getInstance().canWrite(desc))) {
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
    chooseImpl(list, rejectOnNotFound = false) {
        const r = this.chooseNew();
        if (r) {
            return r;
        }
        const graph = this.propertyHandler.getProp('clue_graph', null);
        const desc = list.find((d) => d.id === graph);
        return this.loadChosen(graph, desc, rejectOnNotFound);
    }
    chooseLazyImpl(rejectOnNotFound = false) {
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
    choose(list, rejectOnNotFound = false) {
        return this.chooseImpl(list, rejectOnNotFound).then((g) => this.setGraph(g));
    }
    loadOrClone(graph, isSelect) {
        if (isSelect) {
            this.loadGraph(graph);
        }
        else {
            this.cloneLocal(graph);
        }
    }
    cloneLocal(graph) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        if (this.useInMemoryGraph()) {
            if (!this.isReadOnly) {
                this.setGraphInUrl('memory');
            }
            return this.manager.cloneInMemory(graph);
        }
        return this.manager.cloneLocal(graph).then((g) => this.loadGraph(g.desc));
    }
    useInMemoryGraph() {
        return this.propertyHandler.has('clue_headless') || this.propertyHandler.getProp('clue_graph', '') === 'memory';
    }
    /**
     * create the provenance graph selection dropdown and handles the graph selection
     * @param manager
     * @returns {Promise<U>}
     */
    static choose(manager) {
        return manager.list().then((list) => manager.choose(list));
    }
}
CLUEGraphManager.EVENT_EXTERNAL_STATE_CHANGE = 'externalStateChanged';
/**
 * update hash in 100ms to prevent to frequent updates
 * @type {number}
 */
CLUEGraphManager.DEBOUNCE_UPDATE_DELAY = 100;
//# sourceMappingURL=CLUEGraphManager.js.map