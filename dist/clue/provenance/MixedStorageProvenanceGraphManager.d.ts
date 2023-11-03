import { IProvenanceGraphDump, ProvenanceGraph } from './ProvenanceGraph';
import { IProvenanceGraphManager } from './provenance';
import { IProvenanceGraphDataDescription } from './ICmd';
import { ILocalStorageProvenanceGraphManagerOptions } from './LocalStorageProvenanceGraphManager';
import { IRemoteStorageProvenanceGraphManagerOptions } from './RemoteStorageProvenanceGraphManager';
import { GraphBase } from '../graph/GraphBase';
export type IMixedStorageProvenanceGraphManagerOptions = ILocalStorageProvenanceGraphManagerOptions & IRemoteStorageProvenanceGraphManagerOptions;
export declare class MixedStorageProvenanceGraphManager implements IProvenanceGraphManager {
    private remote;
    private local;
    constructor(options?: IMixedStorageProvenanceGraphManagerOptions);
    listRemote(): Promise<IProvenanceGraphDataDescription[]>;
    listLocal(): Promise<IProvenanceGraphDataDescription[]>;
    listLocalSync(): IProvenanceGraphDataDescription[];
    list(): Promise<IProvenanceGraphDataDescription[]>;
    delete(desc: IProvenanceGraphDataDescription): PromiseLike<boolean>;
    get(desc: IProvenanceGraphDataDescription): PromiseLike<ProvenanceGraph>;
    getGraph(desc: IProvenanceGraphDataDescription): PromiseLike<GraphBase>;
    edit(graph: IProvenanceGraphDataDescription | ProvenanceGraph, desc: any): PromiseLike<IProvenanceGraphDataDescription>;
    cloneLocal(desc: IProvenanceGraphDataDescription, extras?: any): Promise<ProvenanceGraph>;
    cloneRemote(desc: IProvenanceGraphDataDescription, extras?: any): Promise<ProvenanceGraph>;
    migrateRemote(graph: ProvenanceGraph, extras?: any): PromiseLike<ProvenanceGraph>;
    importLocal(json: IProvenanceGraphDump, desc?: any): Promise<ProvenanceGraph>;
    importRemote(json: IProvenanceGraphDump, desc?: any): Promise<ProvenanceGraph>;
    import(json: IProvenanceGraphDump, desc?: any): Promise<ProvenanceGraph>;
    createLocal(desc?: any): Promise<ProvenanceGraph>;
    createRemote(desc?: any): Promise<ProvenanceGraph>;
    create(desc?: any): Promise<ProvenanceGraph>;
    createInMemory(): ProvenanceGraph;
    cloneInMemory(desc: IProvenanceGraphDataDescription): PromiseLike<ProvenanceGraph>;
}
//# sourceMappingURL=MixedStorageProvenanceGraphManager.d.ts.map