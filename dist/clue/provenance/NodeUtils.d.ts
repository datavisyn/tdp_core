import { StateNode } from './StateNode';
import { ObjectNode } from './ObjectNode';
import { ActionNode } from './ActionNode';
export declare class NodeUtils {
    static findLatestPath(state: StateNode): StateNode[];
    static createdBy<T>(node: ObjectNode<T>): ActionNode;
    static removedBy<T>(node: ObjectNode<T>): ActionNode;
    static requiredBy<T>(node: ObjectNode<T>): ActionNode[];
    static partOf<T>(node: ObjectNode<T>): StateNode[];
    static uses<T>(node: ActionNode): ObjectNode<any>[];
    static creates<T>(node: ActionNode): ObjectNode<any>[];
    static removes<T>(node: ActionNode): ObjectNode<any>[];
    static requires<T>(node: ActionNode): ObjectNode<any>[];
    static resultsIn(node: ActionNode): StateNode;
    static previous(node: ActionNode): StateNode;
}
//# sourceMappingURL=NodeUtils.d.ts.map