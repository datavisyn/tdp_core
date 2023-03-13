import { EventHandler } from 'visyn_core';
import { IProvenanceGraphDataDescription, IProvenanceGraphDump, ProvenanceGraph } from '../provenance';
import type { MixedStorageProvenanceGraphManager } from '../provenance/MixedStorageProvenanceGraphManager';
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
export declare function rewriteURLOtherProperty(selectedProperty: 'hash' | 'query'): void;
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
    constructor(manager: MixedStorageProvenanceGraphManager, { isReadOnly, propertyHandler, rewriteOtherProperty }?: ICLUEGraphManagerOptions);
    private setGraphInUrl;
    static reloadPage(): void;
    private onHashChangedImpl;
    /**
     * Returns the URL only with `clue_graph` and `clue_state` in the hash or query.
     */
    getCLUEGraphURL(): string;
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
    /**
     * Import a provenance graph dump locally or remotely. After importing the graph the page reloads with the graph id in the URL.
     * @param dump Dump of the provenance graph
     * @param remote Import the dump remote or local
     * @param descOverrides Object with key value to override the desc of the provenance graph (use with caution)
     */
    importGraph(dump: IProvenanceGraphDump, remote?: boolean, descOverrides?: any): Promise<void>;
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
    cloneLocal(graph: IProvenanceGraphDataDescription): Promise<void> | PromiseLike<ProvenanceGraph>;
    private useInMemoryGraph;
    /**
     * create the provenance graph selection dropdown and handles the graph selection
     * @param manager
     * @returns {Promise<U>}
     */
    static choose(manager: CLUEGraphManager): Promise<ProvenanceGraph>;
}
export {};
//# sourceMappingURL=CLUEGraphManager.d.ts.map