import { EventHandler } from '../base/event';
import { Range, RangeLike } from '../range';
import { IIDType } from './IIDType';
import { SelectOperation } from './SelectionUtils';
/**
 * An IDType is a semantic aggregation of an entity type, like Patient and Gene.
 *
 * An entity is tracked by a unique identifier (integer) within the system,
 * which is mapped to a common, external identifier or name (string) as well.
 */
export declare class IDType extends EventHandler implements IIDType {
    id: string;
    readonly name: string;
    readonly names: string;
    readonly internal: boolean;
    static readonly EVENT_SELECT = "select";
    /**
     * the current selections
     */
    private readonly sel;
    private readonly name2idCache;
    private readonly id2nameCache;
    canBeMappedTo: Promise<IDType[]>;
    /**
     * @param id the system identifier of this IDType
     * @param name the name of this IDType for external presentation
     * @param names the plural form of above name
     * @param internal whether this is an internal type or not
     */
    constructor(id: string, name: string, names: string, internal?: boolean);
    persist(): {
        sel: any;
        name: string;
        names: string;
    };
    restore(persisted: any): this;
    toString(): string;
    selectionTypes(): string[];
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {Range}
     */
    selections(type?: string): Range;
    /**
     * select the given range as
     * @param range
     */
    select(range: RangeLike): Range;
    select(range: RangeLike, op: SelectOperation): Range;
    select(type: string, range: RangeLike): Range;
    select(type: string, range: RangeLike, op: SelectOperation): Range;
    private selectImpl;
    clear(type?: string): Range;
    /**
     * Cache identifier <-> name mapping in bulk.
     * @param ids the entity identifiers to cache
     * @param names the matching entity names to cache
     */
    fillMapCache(ids: number[], names: string[]): void;
    /**
     * Request the system identifiers for the given entity names.
     * @param names the entity names to resolve
     * @returns a promise of system identifiers that match the input names
     */
    map(names: string[]): Promise<number[]>;
    /**
     * Request the names for the given entity system identifiers.
     * @param ids the entity names to resolve
     * @returns a promise of system identifiers that match the input names
     */
    unmap(ids: RangeLike): Promise<string[]>;
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    search(pattern: string, limit?: number): Promise<IDPair[]>;
    /**
     * chooses whether a GET or POST request based on the expected url length
     * @param url
     * @param data
     * @returns {Promise<any>}
     */
    static chooseRequestMethod(url: string, data?: any): Promise<any>;
}
export declare type IDTypeLike = string | IDType;
export interface IDPair {
    readonly name: string;
    readonly id: number;
}
