import { IStringGroupCriteria } from 'lineupjs';
/**
 * Basic LineUp string filter values
 */
declare type LineUpStringFilterValue = string[] | string | null;
/**
 * Serialize RegExp objects from LineUp string columns as plain object
 * that can be stored in the provenance graph
 */
interface IRegExpFilter {
    /**
     * RegExp as string
     */
    value: LineUpStringFilterValue;
    /**
     * Flag to indicate the value should be restored as RegExp
     */
    isRegExp: boolean;
}
/**
 * This interface combines the `IStringFilter` from `StringColumn`
 * and `ICategoricalFilter` from `ICategoricalColumn`.
 */
interface ILineUpStringFilter {
    /**
     * Filter value
     */
    filter: LineUpStringFilterValue | RegExp;
    /**
     * Filter for missing values
     */
    filterMissing: boolean;
}
/**
 * Similar to the `ILineUpStringFilter`, but the RegExp is replaced with `IRegExpFilter`
 */
interface ISerializableLineUpFilter {
    /**
     * Filter value
     * Note that the RegExp is replaced with IRegExpFilter (compared to the `ILineUpStringFilter` interface)
     */
    filter: LineUpStringFilterValue | IRegExpFilter;
    /**
     * Filter for missing values
     */
    filterMissing: boolean;
}
/**
 * String column's group criterias as stored in the provenance graph.
 */
interface ISerializedStringGroupCriteria extends IStringGroupCriteria {
    values: string[];
}
export declare class LineUpFilterUtils {
    /**
     * This type guard checks if `filter` parameter matches the `LineUpStringFilterValue` type
     * @param filter Any filterable value that should be checked
     * @returns Returns true if filter applies to the `LineUpStringFilterValue`
     */
    static isLineUpStringFilterValue(filter: any): filter is LineUpStringFilterValue;
    /**
     * This type guard checks if `filter` parameter matches the `IRegExpFilter` type.
     * @param filter Any filterable value that should be checked
     * @returns Returns true if filter applies to the `IRegExpFilter`
     */
    static isIRegExpFilter(filter: any): filter is IRegExpFilter;
    /**
     * This type guard checks if the `filter` parameter matches the `isLineUpStringFilter` type.
     *
     * @internal
     * @param filter Any value that could be a filter
     * @returns Returns true if filter should be serialized/restored or false if not.
     */
    static isLineUpStringFilter(filter: any): filter is ILineUpStringFilter;
    /**
     * This type guard checks if the `filter` parameter matches the `ISerializableLineUpFilter` type.
     * Necessary since number columns filter has properties `min`, `max` and no filter property.
     *
     * @internal
     * @param filter Any value that could be a filter
     * @returns Returns true if filter should be serialized/restored or false if not.
     */
    static isSerializedFilter(filter: any): filter is ISerializableLineUpFilter;
    /**
     * Serializes LineUp string filter, which can contain RegExp objects to an IRegexFilter object.
     * The return value of this function can be passed to `JSON.stringify()` and stored in the provenance graph.
     *
     * Background information:
     * The serialization step is necessary, because RegExp objects are converted into an empty object `{}` on `JSON.stringify`.
     * ```
     * JSON.stringify(/^123$/gm); // result: {}
     * ```
     *
     * @internal
     *
     * @param filter LineUp filter object
     * @returns Returns the `ISerializableLineUpFilter` object
     */
    static serializeLineUpFilter(filter: ILineUpStringFilter): ISerializableLineUpFilter;
    /**
     * Coverts a RegExp string to a RegExp instance
     *
     * @internal
     * @param value RegExp string
     * @returns The RegExp instance
     */
    static restoreRegExp(value: string): RegExp;
    /**
     * Restores filter values from the provenance graph and returns an `ILineUpStringFilter`
     * which can be passed to the LineUp instance (using LineUp > 4.0.0).
     *
     * Valid seralized filter values are:
     * - `LineUpStringFilterValue` used with LineUp < 4.0.0 and tdp_core < 9.0.0
     * - `IRegExpFilter` used with LineUp < 4.0.0 and tdp_core >= 9.0.0
     * - `ISerializableLineUpFilter` used with LineUp > 4.0.0 and tdp_core > 9.1.0
     *
     * @interal
     * @param filter Filter with one of the types described above
     * @param filterMissing The flag indicates if missing values should be filtered (default = `false`)
     * @returns Returns an `ILineUpStringFilter` which can be passed to LineUp
     */
    static restoreLineUpFilter(filter: LineUpStringFilterValue | IRegExpFilter | ISerializableLineUpFilter, filterMissing?: boolean): ILineUpStringFilter;
    /**
     * Serializes LineUp StringColumn's `Group By` dialog's values, which can contain a RegExp objects to a string.
     * The return value of this function can be passed to `JSON.stringify()` and stored in the provenance graph.
     * @param groupBy Value returned from the `Group By` dialog
     */
    static serializeGroupByValue(groupBy: IStringGroupCriteria): IStringGroupCriteria;
    /**
     * Restores LineUp StringColumn's Group By` dialog's values from the provenance graph and returns an `IStringGroupCriteria`.
     * @param groupBy Value as saved in the provenance graph.
     */
    static restoreGroupByValue(groupBy: ISerializedStringGroupCriteria): ISerializedStringGroupCriteria | {
        type: import("lineupjs").EStringGroupCriteriaType.regex;
        values: RegExp[];
    };
}
export {};
//# sourceMappingURL=lineUpFilter.d.ts.map