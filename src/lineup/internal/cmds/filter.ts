
/**
 * Serialize RegExp objects from LineUp string columns as plain object
 * that can be stored in the provenance graph
 */
interface IRegExpFilter {
  /**
   * RegExp as string
   */
  value: ILineUpStringFilterValue;
  /**
   * Flag to indicate the value should be restored as RegExp
   */
  isRegExp: boolean;
}

/**
 * This interface combines the `IStringFilter` from `StringColumn`
 * and `ICategoricalFilter` from `ICategoricalColumn`.
 */
export interface ILineUpStringFilter {
  /**
   * Filter value
   */
  filter: ILineUpStringFilterValue | RegExp;

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
  filter: ILineUpStringFilterValue | IRegExpFilter;

  /**
   * Filter for missing values
   */
  filterMissing: boolean;
}

/**
 *  Filter value
 */
type ILineUpStringFilterValue = string[] | string | null;


/**
 * This type guard checks if a given parameter has the `filter` property.
 * Necessary since number columns filter has properties `min`, `max` and no filter property,
 * @interal
 *
 * @param filter Any value that could be a filter
 */
export function isSerializedFilter(filter: any): filter is ISerializableLineUpFilter | ILineUpStringFilter {
  return filter && filter.hasOwnProperty('filter');
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
  const isRegexp = value instanceof RegExp;
  return {
    filter: {
      value: isRegexp ? value.toString() : value as ILineUpStringFilterValue,
      isRegExp: isRegexp
    },
    filterMissing: filter.filterMissing
  };
}

/**
 * Restores a RegExp object from a given IRegExpFilter object.
 * In case a string is passed to this function no deserialization is applied.
 *
 * @interal
 * @param filter Filter as string or plain object matching the IRegExpFilter
 * @param filterMissing The flag indicates if missing values should be filtered (default = `false`)
 * @returns Returns the input string or the restored RegExp object
 */
export function restoreLineUpFilter(filter: ILineUpStringFilterValue | IRegExpFilter | ISerializableLineUpFilter | ILineUpStringFilter, filterMissing = false): ILineUpStringFilter {
  const isSimpleFilter = (filter: ILineUpStringFilterValue | IRegExpFilter | ISerializableLineUpFilter | ILineUpStringFilter): filter is ILineUpStringFilterValue => filter === null || typeof filter === 'string' || Array.isArray(filter) || filter instanceof RegExp;
  const isIRegExpFilter = ((filter: IRegExpFilter | ISerializableLineUpFilter | ILineUpStringFilter): filter is IRegExpFilter => filter.hasOwnProperty('isRegExp'));
  const isISerializableLineUpFilter = (filter: IRegExpFilter | ISerializableLineUpFilter | ILineUpStringFilter): filter is ISerializableLineUpFilter => filter.hasOwnProperty('filterMissing');

  if (isSimpleFilter(filter)) {
    return {filter, filterMissing};

  } else if (isIRegExpFilter(filter)) {
    if (filter.isRegExp) {
      const serializedRegexParser = /^\/(.+)\/(\w+)?$/; // from https://gist.github.com/tenbits/ec7f0155b57b2d61a6cc90ef3d5f8b49
      const matches = serializedRegexParser.exec(filter.value as string);
      const [_full, regexString, regexFlags] = matches;
      return {filter: new RegExp(regexString, regexFlags), filterMissing};
    }

    return restoreLineUpFilter(filter.value, filterMissing);

  } else if (isISerializableLineUpFilter(filter)) {
    return restoreLineUpFilter(filter.filter, filter.filterMissing);

  }

  throw new Error('Unknown LineUp filter format. Unable to restore the given filter.');
}
