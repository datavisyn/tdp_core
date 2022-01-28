import { Range } from './Range';
/**
 * Ranges define which elements of a data structure should be considered. They are useful for slicing the relevant
 * aspects out of a dataset. Ranges can be defined with from/to/step operators or by using explicit indices.
 *
 * The current range implementation also understands string-based range definitions, such as '(0,10,2)', which are,
 * however, discouraged to be used by external modules.
 *
 * Ranges can be directly created using the constructors, or can be created using the helper functions in this file.
 *
 * Many functions also accept a RangeLike that is parsed automatically into a proper range.
 */
/**
 * Something that can be parsed as a range:
 * Either a proper range, an array (of an array) of numbers (treated as indices), or a string. See parser.ts for
 * rules on string ranges.
 */
export declare type RangeLike = Range | number[] | number[][] | string;
//# sourceMappingURL=RangeLike.d.ts.map