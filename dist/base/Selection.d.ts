import { IDType } from '../idtype';
import { IObjectRef, ICmdResult, ActionNode, ProvenanceGraph } from '../provenance';
import { Range } from '../range';
export declare class Selection {
    static select(inputs: IObjectRef<any>[], parameter: any, graph: any, within: any): ICmdResult;
    static capitalize(s: string): string;
    static meta(idtype: IDType, type: string, range: Range): any;
    /**
     * create a selection command
     * @param idtype
     * @param type
     * @param range
     * @param old optional the old selection for inversion
     * @returns {Cmd}
     */
    static createSelection(idtype: IDType, type: string, range: Range, old?: Range, animated?: boolean): any;
    static compressSelection(path: ActionNode[]): ActionNode[];
}
/**
 * utility class to record all the selections within the provenance graph
 */
export declare class SelectionRecorder {
    private graph;
    private type?;
    private options;
    private handler;
    private adder;
    constructor(graph: ProvenanceGraph, type?: string, options?: any);
    destroy(): void;
    static createSelectionRecorder(graph: ProvenanceGraph, type?: string, options?: any): SelectionRecorder;
}
//# sourceMappingURL=Selection.d.ts.map