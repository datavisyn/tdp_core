import { GraphNode } from '../graph/graph';
/**
 * an object reference is a common description of an object node in the provenance graph
 */
export interface IObjectRef<T> {
    /**
     * name of the object
     */
    readonly name: string;
    /**
     * category one of categories
     */
    readonly category: string;
    /**
     * the value
     */
    readonly v: PromiseLike<T>;
    /**
     * maybe null if not defined
     */
    readonly value: T;
    /**
     * a hash for avoiding false duplicate detection
     */
    readonly hash: string;
}
export declare class ObjectRefUtils {
    /**
     * list of categories for actions and objects
     */
    static category: {
        data: string;
        selection: string;
        visual: string;
        layout: string;
        logic: string;
        custom: string;
        annotation: string;
    };
    /**
     * list of operations
     */
    static operation: {
        create: string;
        update: string;
        remove: string;
    };
    /**
     * creates an object reference to the given object
     * @param v
     * @param name
     * @param category
     * @param hash
     * @returns {{v: T, name: string, category: string}}
     */
    static objectRef<T>(v: T, name: string, category?: string, hash?: string): IObjectRef<T>;
}
/**
 * a graph node of type object
 */
export declare class ObjectNode<T> extends GraphNode implements IObjectRef<T> {
    private _v;
    /**
     * a promise of the value accessible via .v
     */
    private _promise;
    private _persisted;
    constructor(_v: T, name: string, category?: string, hash?: string, description?: string);
    get value(): T;
    set value(v: T);
    /**
     * checks whether the persisted value was already restored
     */
    private checkPersisted;
    get v(): PromiseLike<T>;
    get name(): string;
    get category(): string;
    get hash(): string;
    get description(): string;
    persist(): any;
    restore(p: any): this;
    static restore(p: any): ObjectNode<any>;
    toString(): string;
}
//# sourceMappingURL=ObjectNode.d.ts.map