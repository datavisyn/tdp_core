import { EventHandler, IEventHandler } from '../base/event';
import { IPersistable } from '../base/IPersistable';
import { SelectOperation } from './SelectionUtils';
export interface IPersistedIDType {
    sel: {
        [key: string]: string[];
    };
    name: string;
    names: string;
}
/**
 * An IDType is a semantic aggregation of an entity type, like Patient and Gene.
 *
 * An entity is tracked by a unique identifier (integer) within the system,
 * which is mapped to a common, external identifier or name (string) as well.
 */
export declare class IDType extends EventHandler implements IEventHandler, IPersistable {
    id: string;
    readonly name: string;
    readonly names: string;
    readonly internal: boolean;
    static readonly EVENT_SELECT = "select";
    /**
     * the current selections
     */
    private readonly sel;
    canBeMappedTo: Promise<IDType[]>;
    /**
     * @param id the system identifier of this IDType
     * @param name the name of this IDType for external presentation
     * @param names the plural form of above name
     * @param internal whether this is an internal type or not
     */
    constructor(id: string, name: string, names: string, internal?: boolean);
    persist(): IPersistedIDType;
    restore(persisted: IPersistedIDType): this;
    toString(): string;
    selectionTypes(): string[];
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {string[]}
     */
    selections(type?: string): string[];
    /**
     * select the given range as
     * @param range
     */
    select(selection: string[]): string[];
    select(selection: string[], op: SelectOperation): string[];
    select(type: string, selection: string[]): string[];
    select(type: string, selection: string[], op: SelectOperation): string[];
    private selectImpl;
    clear(type?: string): string[];
    /**
     * chooses whether a GET or POST request based on the expected url length
     * @param url
     * @param data
     * @returns {Promise<any>}
     */
    static chooseRequestMethod(url: string, data?: {
        q?: string[];
        mode?: 'all' | 'first';
    }): Promise<any>;
}
export declare type IDTypeLike = string | IDType;
export interface IDPair {
    readonly name: string;
    readonly id: number;
}
//# sourceMappingURL=IDType.d.ts.map