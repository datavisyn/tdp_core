import { IDType, SelectOperation } from 'visyn_core/idtype';
import { ActionMetaData } from './ActionMeta';
import { ActionNode } from './ActionNode';
import { IAction, ICmdFunction, ICmdResult, IInverseActionCreator, IProvenanceGraph, IProvenanceGraphDataDescription } from './ICmd';
import { IObjectRef, ObjectNode } from './ObjectNode';
import { SlideNode } from './SlideNode';
import { StateNode } from './StateNode';
import { ADataType } from '../../data/datatype';
import { GraphBase, IGraphDump } from '../graph/GraphBase';
import { GraphEdge } from '../graph/graph';
export interface IProvenanceGraphDump extends IGraphDump {
    /**
     * Id of the last state node
     */
    act: number | null;
    /**
     * Id of the last action
     */
    lastAction: number | null;
}
export declare class ProvenanceGraph extends ADataType<IProvenanceGraphDataDescription> implements IProvenanceGraph {
    backend: GraphBase;
    private static readonly PROPAGATED_EVENTS;
    private _actions;
    private _objects;
    private _states;
    private _slides;
    act: StateNode;
    private lastAction;
    private currentlyRunning;
    executeCurrentActionWithin: number;
    private nextQueue;
    constructor(desc: IProvenanceGraphDataDescription, backend: GraphBase);
    /**
     * Switches the storage backend of the current provenance graph
     * @param backend Remote or local backend for storing the graph data
     */
    migrateBackend(backend: GraphBase): void;
    get isEmpty(): boolean;
    get dim(): number[];
    selectState(state: StateNode, op?: SelectOperation, type?: string, extras?: {}): void;
    selectSlide(slide: SlideNode, op?: SelectOperation, type?: string, extras?: {}): void;
    selectAction(action: ActionNode, op?: SelectOperation, type?: string): void;
    selectedStates(type?: string): StateNode[];
    selectedSlides(type?: string): SlideNode[];
    get idtypes(): IDType[];
    clear(): Promise<GraphBase>;
    get states(): StateNode[];
    getStateById(id: number): StateNode;
    get actions(): ActionNode[];
    getActionById(id: number): ActionNode;
    get objects(): ObjectNode<any>[];
    getObjectById(id: number): ObjectNode<any>;
    get stories(): SlideNode[];
    getSlideById(id: number): SlideNode;
    getSlideChains(): SlideNode[];
    getSlides(): SlideNode[][];
    get edges(): GraphEdge[];
    private addEdge;
    private createAction;
    private initAction;
    createInverse(action: ActionNode, inverter: IInverseActionCreator): ActionNode;
    push(action: IAction): Promise<ICmdResult>;
    push(meta: ActionMetaData, functionId: string, f: ICmdFunction, inputs: IObjectRef<any>[], parameter: any): Promise<ICmdResult>;
    pushWithResult(action: IAction, result: ICmdResult): PromiseLike<any>;
    findObject<T>(value: T): ObjectNode<any>;
    addObject<T>(value: T, name?: string, category?: string, hash?: string): ObjectNode<T>;
    addJustObject<T>(value: T, name?: string, category?: string, hash?: string): ObjectNode<T>;
    private addObjectImpl;
    private resolve;
    private static findInArray;
    findOrAddObject<T>(i: T | IObjectRef<T>, name?: string, type?: any): ObjectNode<T>;
    findOrAddJustObject<T>(i: T | IObjectRef<T>, name?: string, type?: any): ObjectNode<T>;
    private findOrAddObjectImpl;
    private inOrder;
    private executedAction;
    private run;
    private switchToImpl;
    /**
     * execute a bunch of already executed actions
     * @param actions
     */
    private runChain;
    undo(): PromiseLike<any>;
    jumpTo(state: StateNode, withinMilliseconds?: number): PromiseLike<any>;
    /**
     *
     * @param action the action to fork and attach to target
     * @param target the state to attach the given action and all of the rest
     * @param objectReplacements mappings of object replacements
     * @returns {boolean}
     */
    fork(action: ActionNode, target: StateNode, objectReplacements?: {
        from: IObjectRef<any>;
        to: IObjectRef<any>;
    }[]): boolean;
    private copyAction;
    private copyBranch;
    private makeState;
    persist(): IProvenanceGraphDump;
    wrapAsSlide(state: StateNode): SlideNode;
    cloneSingleSlideNode(state: SlideNode): SlideNode;
    /**
     * creates a new slide of the given StateNode by jumping to them
     * @param states
     */
    extractSlide(states: StateNode[], addStartEnd?: boolean): SlideNode;
    startNewSlide(title?: string, states?: StateNode[]): SlideNode;
    makeTextSlide(title?: string): SlideNode;
    insertIntoSlide(toInsert: SlideNode, slide: SlideNode, beforeIt?: boolean): void;
    appendToSlide(slide: SlideNode, elem: SlideNode): void;
    moveSlide(node: SlideNode, to: SlideNode, beforeIt?: boolean): void;
    removeSlideNode(node: SlideNode): void;
    removeFullSlide(node: SlideNode): void;
    setSlideJumpToTarget(node: SlideNode, state: StateNode): void;
    static createDummy(): ProvenanceGraph;
    static getOrCreateInverse(node: ActionNode, graph: ProvenanceGraph): ActionNode;
    static updateInverse(node: ActionNode, graph: ProvenanceGraph, inverter: IInverseActionCreator): void;
    static execute(node: ActionNode, graph: ProvenanceGraph, withinMilliseconds: number): PromiseLike<ICmdResult>;
}
//# sourceMappingURL=ProvenanceGraph.d.ts.map