/**
 * Created by Samuel Gratzl on 28.02.2017.
 */
import { ProvenanceGraph } from 'phovea_core';
import { CLUEGraphManager } from 'phovea_clue';
export declare class EditProvenanceGraphMenu {
    private readonly manager;
    readonly node: HTMLLIElement;
    private graph;
    constructor(manager: CLUEGraphManager, parent: HTMLElement);
    updateGraphMetaData(graph: ProvenanceGraph): void;
    setGraph(graph: ProvenanceGraph): void;
    private init;
}
