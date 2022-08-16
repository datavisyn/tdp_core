export class LineUpFilterUtils {
    /**
     * This type guard checks if `filter` parameter matches the `LineUpStringFilterValue` type
     * @param filter Any filterable value that should be checked
     * @returns Returns true if filter applies to the `LineUpStringFilterValue`
     */
    static isLineUpStringFilterValue(filter) {
        return filter === null || typeof filter === 'string' || Array.isArray(filter);
    }
    /**
     * This type guard checks if `filter` parameter matches the `IRegExpFilter` type.
     * @param filter Any filterable value that should be checked
     * @returns Returns true if filter applies to the `IRegExpFilter`
     */
    static isIRegExpFilter(filter) {
        return filter && filter.hasOwnProperty('value') && LineUpFilterUtils.isLineUpStringFilterValue(filter.value) && filter.hasOwnProperty('isRegExp');
    }
    /**
     * This type guard checks if the `filter` parameter matches the `isLineUpStringFilter` type.
     *
     * @internal
     * @param filter Any value that could be a filter
     * @returns Returns true if filter should be serialized/restored or false if not.
     */
    static isLineUpStringFilter(filter) {
        return (filter &&
            filter.hasOwnProperty('filter') &&
            (LineUpFilterUtils.isLineUpStringFilterValue(filter.filter) || filter.filter instanceof RegExp) &&
            filter.hasOwnProperty('filterMissing'));
    }
    /**
     * This type guard checks if the `filter` parameter matches the `ISerializableLineUpFilter` type.
     * Necessary since number columns filter has properties `min`, `max` and no filter property.
     *
     * @internal
     * @param filter Any value that could be a filter
     * @returns Returns true if filter should be serialized/restored or false if not.
     */
    static isSerializedFilter(filter) {
        return (filter &&
            filter.hasOwnProperty('filter') &&
            (LineUpFilterUtils.isLineUpStringFilterValue(filter.filter) || LineUpFilterUtils.isIRegExpFilter(filter.filter)) &&
            filter.hasOwnProperty('filterMissing'));
    }
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
    static serializeLineUpFilter(filter) {
        const value = filter.filter;
        const isRegExp = value instanceof RegExp;
        return {
            filter: {
                value: isRegExp ? value.toString() : value,
                isRegExp,
            },
            filterMissing: filter.filterMissing,
        };
    }
    /**
     * Coverts a RegExp string to a RegExp instance
     *
     * @internal
     * @param value RegExp string
     * @returns The RegExp instance
     */
    static restoreRegExp(value) {
        const serializedRegexParser = /^\/(.+)\/(\w+)?$/; // from https://gist.github.com/tenbits/ec7f0155b57b2d61a6cc90ef3d5f8b49
        const matches = serializedRegexParser.exec(value);
        if (matches === null) {
            throw new Error('Unable to parse regular expression from string. The string does not seem to be a valid RegExp.');
        }
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const [_full, regexString, regexFlags] = matches;
        return new RegExp(regexString, regexFlags);
    }
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
    static restoreLineUpFilter(filter, filterMissing = false) {
        if (LineUpFilterUtils.isLineUpStringFilterValue(filter)) {
            return { filter, filterMissing };
        }
        if (LineUpFilterUtils.isIRegExpFilter(filter) && filter.isRegExp === true) {
            if (typeof filter.value === 'string') {
                return { filter: LineUpFilterUtils.restoreRegExp(filter.value), filterMissing };
            }
            throw new Error('Wrong type of filter value. Unable to restore RegExp instance from the given filter value.');
        }
        else if (LineUpFilterUtils.isIRegExpFilter(filter) && filter.isRegExp === false) {
            return LineUpFilterUtils.restoreLineUpFilter(filter.value, filterMissing);
        }
        else if (LineUpFilterUtils.isSerializedFilter(filter)) {
            return LineUpFilterUtils.restoreLineUpFilter(filter.filter, filter.filterMissing);
        }
        throw new Error('Unknown LineUp filter format. Unable to restore the given filter.');
    }
    /**
     * Serializes LineUp StringColumn's `Group By` dialog's values, which can contain a RegExp objects to a string.
     * The return value of this function can be passed to `JSON.stringify()` and stored in the provenance graph.
     * @param groupBy Value returned from the `Group By` dialog
     */
    static serializeGroupByValue(groupBy) {
        const { type, values } = groupBy;
        if (type === 'regex') {
            return {
                type,
                values: values.map((value) => value.toString()),
            };
        }
        return groupBy;
    }
    /**
     * Restores LineUp StringColumn's Group By` dialog's values from the provenance graph and returns an `IStringGroupCriteria`.
     * @param groupBy Value as saved in the provenance graph.
     */
    static restoreGroupByValue(groupBy) {
        const { type, values } = groupBy;
        if (type === 'regex') {
            return {
                type,
                values: values.map((value) => LineUpFilterUtils.restoreRegExp(value)),
            };
        }
        return groupBy;
    }
}
//# sourceMappingURL=lineUpFilter.js.map