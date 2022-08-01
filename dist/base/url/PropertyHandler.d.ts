import { EventHandler } from '../event';
export declare class PropertyHandler extends EventHandler {
    static readonly EVENT_CHANGED = "changed";
    static readonly EVENT_ENTRY_CHANGED = "entryChanged";
    protected readonly map: Map<string, any>;
    constructor(code?: string);
    /**
     * returns the contained keys of this property handler
     * @returns {string[]}
     */
    keys(): string[];
    /**
     * iterate over each entry in the map
     * @param f
     */
    forEach(f: (key: string, value: any) => void): void;
    /**
     * whether the given name is defined i.e., not null
     * @deprecated use has(name)
     * @param name
     * @returns {boolean}
     */
    is(name: string): boolean;
    has(name: string): boolean;
    /**
     * returns the given value with optional default value
     * @param name
     * @param defaultValue
     * @returns {any}
     */
    getProp(name: string, defaultValue?: string): any;
    /**
     * returns the given integer value with optional default, the value itself might be encoded to safe space
     * @param name
     * @param defaultValue
     * @returns {number}
     */
    getInt(name: string, defaultValue?: number): number;
    /**
     * removes the property from the map
     * @param name
     * @returns {boolean}
     */
    removeProp(name: string): boolean;
    toString(): string;
    protected parse(code?: string): void;
}
//# sourceMappingURL=PropertyHandler.d.ts.map