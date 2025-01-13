import type { IProvenanceGraphDataDescription } from './ICmd';
import type { ProvenanceGraph } from './ProvenanceGraph';
import type { CLUEGraphManager } from '../base/CLUEGraphManager';
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
//# sourceMappingURL=ProvenanceGraphMenu.d.ts.map