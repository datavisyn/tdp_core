import { EventHandler } from '../../base/event';
import { IProvenanceGraphDataDescription, ProvenanceGraph } from '../provenance';
import type { MixedStorageProvenanceGraphManager } from '../provenance/MixedStorageProvenanceGraphManager';
export interface IClueState {
    graph: string;
    slide: number;
    state: number;
}
export declare class CLUEGraphManager extends EventHandler {
    private manager;
    static readonly EVENT_EXTERNAL_STATE_CHANGE = "externalStateChanged";
    /**
     * update hash in 100ms to prevent to frequent updates
     * @type {number}
     */
    private static readonly DEBOUNCE_UPDATE_DELAY;
    /**
     * Property handler to manipulate the hash or search query of the URL
     */
    private readonly propertyHandler;
    /**
     * Is this graph manager read-only mode?
     */
    private isReadOnly;
    private onHashChanged;
    constructor(manager: MixedStorageProvenanceGraphManager, { isReadOnly, propertyHandler }?: {
        isReadOnly?: boolean;
        propertyHandler?: 'query' | 'hash';
    });
    private setGraphInUrl;
    static reloadPage(): void;
    private onHashChangedImpl;
    newRemoteGraph(): void;
    newGraph(): void;
    loadGraph(desc: any): void;
    get storedSlide(): number;
    set storedSlide(value: number);
    get storedState(): number;
    set storedState(value: number);
    get isAutoPlay(): boolean;
    list(): Promise<IProvenanceGraphDataDescription[]>;
    delete(graph: IProvenanceGraphDataDescription): PromiseLike<boolean>;
    startFromScratch(): void;
    importGraph(dump: any, remote?: boolean): void;
    importExistingGraph(graph: IProvenanceGraphDataDescription, extras?: any, cleanUpLocal?: boolean): Promise<void>;
    migrateGraph(graph: ProvenanceGraph, extras?: any): PromiseLike<ProvenanceGraph>;
    editGraphMetaData(graph: IProvenanceGraphDataDescription, extras?: any): PromiseLike<IProvenanceGraphDataDescription>;
    setGraph(graph: ProvenanceGraph): ProvenanceGraph;
    private chooseNew;
    private loadChosen;
    private chooseImpl;
    private chooseLazyImpl;
    chooseLazy(rejectOnNotFound?: boolean): PromiseLike<ProvenanceGraph>;
    choose(list: IProvenanceGraphDataDescription[], rejectOnNotFound?: boolean): PromiseLike<ProvenanceGraph>;
    loadOrClone(graph: IProvenanceGraphDataDescription, isSelect: boolean): void;
    cloneLocal(graph: IProvenanceGraphDataDescription): PromiseLike<ProvenanceGraph> | Promise<void>;
    private useInMemoryGraph;
    /**
     * create the provenance graph selection dropdown and handles the graph selection
     * @param manager
     * @returns {Promise<U>}
     */
    static choose(manager: CLUEGraphManager): Promise<ProvenanceGraph>;
}
//# sourceMappingURL=CLUEGraphManager.d.ts.map