import { isFunction } from 'lodash';
import { EXTENSION_POINT_VISYN_VIEW } from '../../base/extensions';
/**
 * Resolves the current value of a setStateAction by calling it with the current value if it is a function,
 * or by simply returning the value otherwise.
 * @param valueOrFunction Value or function to the value.
 * @param currentValue Current value passed to the function to receive the new value.
 */
export function setStateActionCaller(valueOrFunction, currentValue) {
    if (isFunction(valueOrFunction)) {
        return valueOrFunction(currentValue);
    }
    return valueOrFunction;
}
export function isVisynViewPluginDesc(desc) {
    return desc?.type === EXTENSION_POINT_VISYN_VIEW;
}
export function isVisynSimpleViewDesc(desc) {
    return isVisynViewPluginDesc(desc) && desc?.visynViewType === 'simple';
}
export function isVisynSimpleView(plugin) {
    return isVisynViewPluginDesc(plugin?.desc) && plugin?.viewType === 'simple';
}
export function isVisynDataViewDesc(desc) {
    return isVisynViewPluginDesc(desc) && desc?.visynViewType === 'data';
}
export function isVisynDataView(plugin) {
    return isVisynViewPluginDesc(plugin?.desc) && plugin?.viewType === 'data';
}
//# sourceMappingURL=utils.js.map