import { GraphNode } from '../graph/graph';
import { ObjectNode, IObjectRef } from './ObjectNode';
import { ICmdFunction, IInverseActionCreator, ICmdFunctionFactory, IAction } from './ICmd';
import { ActionMetaData } from './ActionMeta';
export declare class ActionUtils {
    /**
     * creates an action given the data
     * @param meta
     * @param id
     * @param f
     * @param inputs
     * @param parameter
     * @returns {{meta: ActionMetaData, id: string, f: (function(IObjectRef<any>[], any, ProvenanceGraph): ICmdResult), inputs: IObjectRef<any>[], parameter: any}}
     */
    static action(meta: ActionMetaData, id: string, f: ICmdFunction, inputs?: IObjectRef<any>[], parameter?: any): IAction;
}
export declare class ActionNode extends GraphNode {
    f: ICmdFunction;
    inverter: IInverseActionCreator;
    constructor(meta: ActionMetaData, functionId: string, f: ICmdFunction, parameter?: any);
    clone(): ActionNode;
    get name(): string;
    get meta(): ActionMetaData;
    get f_id(): string;
    get parameter(): any;
    set parameter(value: any);
    get onceExecuted(): boolean;
    set onceExecuted(value: boolean);
    static restore(r: any, factory: ICmdFunctionFactory): ActionNode;
    toString(): string;
    get inversedBy(): ActionNode;
    /**
     * inverses another action
     * @returns {ActionNode}
     */
    get inverses(): ActionNode;
    get isInverse(): boolean;
    equals(that: ActionNode): boolean;
    get uses(): ObjectNode<any>[];
    get creates(): ObjectNode<any>[];
    get removes(): ObjectNode<any>[];
    get requires(): ObjectNode<any>[];
}
/**
 * an action compressor is used to compress a series of action to fewer one, e.g. create and remove can be annihilated
 */
export interface IActionCompressor {
    (path: ActionNode[]): ActionNode[];
}
//# sourceMappingURL=ActionNode.d.ts.map