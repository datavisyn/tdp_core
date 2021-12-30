import {Range} from './Range';
/*export {default as Range, all, none} from './Range';
export {default as Range1D} from './Range1D';
export {default as CompositeRange1D} from './CompositeRange1D';
export {default as Range1DGroup} from './Range1DGroup';*/


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
export type RangeLike = Range | number[] | number[][] | string;

