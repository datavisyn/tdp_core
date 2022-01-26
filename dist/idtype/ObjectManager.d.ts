import { IDType } from './IDType';
export interface IHasUniqueId {
    id: number;
}
export declare class HasUniqueIdUtils {
    static toId(elem: IHasUniqueId): number;
    static isId(id: number): (elem: IHasUniqueId) => boolean;
}
/**
 * IDType with an actual collection of entities.
 * Supports selections.
 */
export declare class ObjectManager<T extends IHasUniqueId> extends IDType {
    private readonly instances;
    private readonly pool;
    constructor(id: string, name: string);
    nextId(item?: T): number;
    push(...items: T[]): void;
    byId(id: number): T;
    forEach(callbackfn: (value: T) => void, thisArg?: any): void;
    get entries(): T[];
    remove(id: number): T;
    remove(item: T): T;
    selectedObjects(type?: string): string[];
}
