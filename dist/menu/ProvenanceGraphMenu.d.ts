import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { ProvenanceGraph, IProvenanceGraphDataDescription } from '../provenance';
export declare class ProvenanceGraphMenu {
    private readonly manager;
    private readonly $node;
    private graph;
    constructor(manager: CLUEGraphManager, parent: HTMLElement, appendChild?: boolean);
    get node(): HTMLElement;
    setGraph(graph: ProvenanceGraph): void;
    private init;
    build(graphs: IProvenanceGraphDataDescription[]): void;
}
