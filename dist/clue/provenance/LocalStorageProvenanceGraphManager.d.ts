import { IProvenanceGraphDataDescription } from './ICmd';
import { IProvenanceGraphDump, ProvenanceGraph } from './ProvenanceGraph';
import { ICommonProvenanceGraphManagerOptions, IProvenanceGraphManager } from './provenance';
import { GraphBase } from '../graph/GraphBase';
import { LocalStorageGraph } from '../graph/LocalStorageGraph';
export interface ILocalStorageProvenanceGraphManagerOptions extends ICommonProvenanceGraphManagerOptions {
    /**
     * Used storage engine of the browser (`localStorage` or `sessionStorage`)
     * @default localStorage
     */
    storage?: Storage;
    /**
     * Graph prefix that is for instance used in the URL hash
     * @default clue
     */
    prefix?: string;
    /**
     * Default permissions for new graphs.
     * @default ALL_NONE_NONE
     */
    defaultPermission?: number;
}
export declare class LocalStorageProvenanceGraphManager implements IProvenanceGraphManager {
    private options;
    constructor(options?: ILocalStorageProvenanceGraphManagerOptions);
    private loadFromLocalStorage;
    listSync(): IProvenanceGraphDataDescription[];
    list(): Promise<IProvenanceGraphDataDescription[]>;
    getGraph(desc: IProvenanceGraphDataDescription): PromiseLike<LocalStorageGraph>;
    get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph>;
    clone(graph: GraphBase, desc?: any): Promise<ProvenanceGraph>;
    import(json: IProvenanceGraphDump, desc?: any): Promise<ProvenanceGraph>;
    delete(desc: IProvenanceGraphDataDescription): Promise<boolean>;
    edit(graph: ProvenanceGraph | IProvenanceGraphDataDescription, desc?: any): Promise<IProvenanceGraphDataDescription>;
    private createDesc;
    create(desc?: any): Promise<ProvenanceGraph>;
    private createInMemoryDesc;
    createInMemory(): ProvenanceGraph;
    cloneInMemory(graph: GraphBase): ProvenanceGraph;
}
//# sourceMappingURL=LocalStorageProvenanceGraphManager.d.ts.map