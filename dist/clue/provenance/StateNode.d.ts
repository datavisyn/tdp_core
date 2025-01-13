import { ActionNode } from './ActionNode';
import { ObjectNode } from './ObjectNode';
import { GraphNode } from '../graph/graph';
/**
 * a state node is one state in the visual exploration consisting of an action creating it and one or more following ones.
 * In addition, a state is characterized by the set of active object nodes
 */
export declare class StateNode extends GraphNode {
    constructor(name: string, description?: string);
    get name(): string;
    set name(value: string);
    get description(): string;
    set description(value: string);
    static restore(p: any): StateNode;
    /**
     * this state consists of the following objects
     * @returns {ObjectNode<any>[]}
     */
    get consistsOf(): ObjectNode<any>[];
    /**
     * returns the actions leading to this state
     * @returns {ActionNode[]}
     */
    get resultsFrom(): ActionNode[];
    /**
     *
     * @returns {any}
     */
    get creator(): ActionNode;
    get next(): ActionNode[];
    get previousState(): StateNode;
    get previousStates(): StateNode[];
    get nextStates(): StateNode[];
    get nextState(): StateNode;
    get path(): StateNode[];
    private pathImpl;
    toString(): string;
    static resultsIn<T>(node: GraphNode): StateNode;
    static previous(node: GraphNode): StateNode;
}
//# sourceMappingURL=StateNode.d.ts.map