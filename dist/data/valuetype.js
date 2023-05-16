/**
 * This file defines interfaces for various data types and their metadata.
 */
import { BaseUtils } from '../base';
function isNumeric(obj) {
    return obj - parseFloat(obj) + 1 >= 0;
}
class ValueTypeUtils {
    /**
     * guesses the type of the given value array returning its description
     * @param arr
     * @return {any}
     */
    static guessValueTypeDesc(arr) {
        if (arr.length === 0) {
            return { type: 'string' }; // doesn't matter
        }
        const test = arr[0];
        if (typeof test === 'number' || isNumeric(test)) {
            return { type: ValueTypeUtils.VALUE_TYPE_REAL, range: BaseUtils.extent(arr.map(parseFloat)) };
        }
        const values = new Set(arr);
        if (values.size < arr.length * 0.2 || values.size < 8) {
            // guess as categorical
            return { type: 'categorical', categories: Array.from(values.values()) };
        }
        return { type: 'string' };
    }
    static maskImpl(arr, missing) {
        if (Array.isArray(arr)) {
            const vs = arr;
            if (vs.indexOf(missing) >= 0) {
                return vs.map((v) => (v === missing ? NaN : v));
            }
        }
        return arr === missing ? NaN : arr;
    }
    static mask(arr, desc) {
        if (desc.type === ValueTypeUtils.VALUE_TYPE_INT && 'missing' in desc) {
            return ValueTypeUtils.maskImpl(arr, desc.missing);
        }
        if (desc.type === ValueTypeUtils.VALUE_TYPE_INT || desc.type === ValueTypeUtils.VALUE_TYPE_REAL) {
            // replace null values with Number.NaN
            return ValueTypeUtils.maskImpl(arr, null);
        }
        return arr;
    }
}
ValueTypeUtils.VALUE_TYPE_CATEGORICAL = 'categorical';
ValueTypeUtils.VALUE_TYPE_STRING = 'string';
ValueTypeUtils.VALUE_TYPE_REAL = 'real';
ValueTypeUtils.VALUE_TYPE_INT = 'int';
export { ValueTypeUtils };
//# sourceMappingURL=valuetype.js.map