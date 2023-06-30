import { ProvenanceGraph } from './ProvenanceGraph';
import type { IProvenanceGraphManager, ICommonProvenanceGraphManagerOptions } from './provenance';
import type { IProvenanceGraphDataDescription } from './ICmd';
import { GraphBase } from '../graph/GraphBase';
export interface IRemoteStorageProvenanceGraphManagerOptions extends ICommonProvenanceGraphManagerOptions {
}
export declare class RemoteStorageProvenanceGraphManager implements IProvenanceGraphManager {
    private options;
    constructor(options?: IRemoteStorageProvenanceGraphManagerOptions);
    list(): Promise<IProvenanceGraphDataDescription[]>;
    getGraph(desc: IProvenanceGraphDataDescription): Promise<GraphBase>;
    get(desc: IProvenanceGraphDataDescription): Promise<ProvenanceGraph>;
    delete(desc: IProvenanceGraphDataDescription): Promise<boolean>;
    clone(graph: GraphBase, desc?: any): PromiseLike<ProvenanceGraph>;
    /**
     * Import a provenance graph from a JSON object and return the imported graph
     * @param json Nodes and edges to be imported
     * @param desc Provenance graph metadata description to be merged with the imported graph
     * @returns Returns the imported provenance graph
     */
    import(json: any, desc?: any): Promise<ProvenanceGraph>;
    /**
     * Migrate a given provenance graph to a remote storage backend and return the migrated graph
     * @param graph Provenance graph to be migrated
     * @param desc Provenance graph metadata description to be merged with the migrated graph
     * @returns Returns the migrated provenance graph
     */
    migrate(graph: ProvenanceGraph, desc?: any): Promise<ProvenanceGraph>;
    edit(graph: ProvenanceGraph | IProvenanceGraphDataDescription, desc?: any): Promise<IProvenanceGraphDataDescription>;
    create(desc?: any): Promise<ProvenanceGraph>;
}
//# sourceMappingURL=RemoteStorageProvenanceGraphManager.d.ts.map