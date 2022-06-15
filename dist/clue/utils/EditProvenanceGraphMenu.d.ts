import { CLUEGraphManager } from '../base/CLUEGraphManager';
import { ProvenanceGraph } from '../provenance';
export declare class EditProvenanceGraphMenu {
    private readonly manager;
    readonly node: HTMLLIElement;
    private graph;
    constructor(manager: CLUEGraphManager, parent: HTMLElement);
    updateGraphMetaData(graph: ProvenanceGraph): void;
    setGraph(graph: ProvenanceGraph): void;
    private init;
}
//# sourceMappingURL=EditProvenanceGraphMenu.d.ts.map