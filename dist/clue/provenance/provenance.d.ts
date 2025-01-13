import { IProvenanceGraph, IProvenanceGraphDataDescription } from './ICmd';
export declare enum ProvenanceGraphDim {
    Action = 0,
    Object = 1,
    State = 2,
    Slide = 3
}
export interface ICommonProvenanceGraphManagerOptions {
    /**
     * Application where the provenance graph is used
     * @default unknown
     */
    application?: string;
}
export interface IProvenanceGraphManager {
    list(): PromiseLike<IProvenanceGraphDataDescription[]>;
    get(desc: IProvenanceGraphDataDescription): PromiseLike<IProvenanceGraph>;
    create(): PromiseLike<IProvenanceGraph>;
    edit(graph: IProvenanceGraphDataDescription | IProvenanceGraph, desc: any): PromiseLike<IProvenanceGraphDataDescription>;
    delete(desc: IProvenanceGraphDataDescription): PromiseLike<boolean>;
    import(json: any): PromiseLike<IProvenanceGraph>;
}
//# sourceMappingURL=provenance.d.ts.map