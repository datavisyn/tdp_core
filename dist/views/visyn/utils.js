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
    return (desc === null || desc === void 0 ? void 0 : desc.type) === EXTENSION_POINT_VISYN_VIEW;
}
export function isVisynSimpleViewDesc(desc) {
    return isVisynViewPluginDesc(desc) && (desc === null || desc === void 0 ? void 0 : desc.visynViewType) === 'simple';
}
export function isVisynSimpleView(plugin) {
    return isVisynViewPluginDesc(plugin === null || plugin === void 0 ? void 0 : plugin.desc) && (plugin === null || plugin === void 0 ? void 0 : plugin.viewType) === 'simple';
}
export function isVisynDataViewDesc(desc) {
    return isVisynViewPluginDesc(desc) && (desc === null || desc === void 0 ? void 0 : desc.visynViewType) === 'data';
}
export function isVisynDataView(plugin) {
    return isVisynViewPluginDesc(plugin === null || plugin === void 0 ? void 0 : plugin.desc) && (plugin === null || plugin === void 0 ? void 0 : plugin.viewType) === 'data';
}
//# sourceMappingURL=utils.js.map