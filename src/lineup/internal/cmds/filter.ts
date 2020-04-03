/**
 * Basic LineUp string filter values
 */
type LineUpStringFilterValue = string[] | string | null;

/**
 * This type guard checks if `filter` parameter matches the `LineUpStringFilterValue` type
 * @param filter Any filterable value that should be checked
 * @returns Returns true if filter applies to the `LineUpStringFilterValue`
 */
function isLineUpStringFilterValue(filter: any): filter is LineUpStringFilterValue {
  return filter === null || typeof filter === 'string' || Array.isArray(filter);
}

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
 * This type guard checks if `filter` parameter matches the `IRegExpFilter` type.
 * @param filter Any filterable value that should be checked
 * @returns Returns true if filter applies to the `IRegExpFilter`
 */
function isIRegExpFilter(filter: any): filter is IRegExpFilter {
  return filter && filter.hasOwnProperty('value') && isLineUpStringFilterValue(filter.value) && filter.hasOwnProperty('isRegExp');
}

/**
 * This interface combines the `IStringFilter` from `StringColumn`
 * and `ICategoricalFilter` from `ICategoricalColumn`.
 */
export interface ILineUpStringFilter {
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
 * This type guard checks if the `filter` parameter matches the `ISerializableLineUpFilter` type.
 * Necessary since number columns filter has properties `min`, `max` and no filter property.
 *
 * @internal
 * @param filter Any value that could be a filter
 * @returns Returns true if filter should be serialized/restored or false if not.
 */
export function isSerializedFilter(filter: any): filter is ISerializableLineUpFilter {
  return filter && filter.hasOwnProperty('filter') && (isLineUpStringFilterValue(filter.filter) || isIRegExpFilter(filter.filter)) && filter.hasOwnProperty('filterMissing');
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
export function serializeLineUpFilter(filter: ILineUpStringFilter): ISerializableLineUpFilter {
  const value = filter.filter;
  const isRegExp = value instanceof RegExp;
  return {
    filter: {
      value: isRegExp ? value.toString() : value as LineUpStringFilterValue,
      isRegExp
    },
    filterMissing: filter.filterMissing
  };
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
export function restoreLineUpFilter(filter: LineUpStringFilterValue | IRegExpFilter | ISerializableLineUpFilter, filterMissing = false): ILineUpStringFilter {
  if (isLineUpStringFilterValue(filter)) {
    return {filter, filterMissing};

  } else if (isIRegExpFilter(filter)) {
    if (filter.isRegExp) {
      const serializedRegexParser = /^\/(.+)\/(\w+)?$/; // from https://gist.github.com/tenbits/ec7f0155b57b2d61a6cc90ef3d5f8b49
      const matches = serializedRegexParser.exec(filter.value as string);
      const [_full, regexString, regexFlags] = matches;
      return {filter: new RegExp(regexString, regexFlags), filterMissing};
    }

    return restoreLineUpFilter(filter.value, filterMissing);

  } else if (isSerializedFilter(filter)) {
    return restoreLineUpFilter(filter.filter, filter.filterMissing);

  }

  throw new Error('Unknown LineUp filter format. Unable to restore the given filter.');
}
