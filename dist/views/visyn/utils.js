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
    var _a;
    return ((_a = desc) === null || _a === void 0 ? void 0 : _a.type) === EXTENSION_POINT_VISYN_VIEW;
}
export function isVisynSimpleViewDesc(desc) {
    var _a;
    return isVisynViewPluginDesc(desc) && ((_a = desc) === null || _a === void 0 ? void 0 : _a.visynViewType) === 'simple';
}
export function isVisynSimpleView(plugin) {
    var _a, _b;
    return isVisynViewPluginDesc((_a = plugin) === null || _a === void 0 ? void 0 : _a.desc) && ((_b = plugin) === null || _b === void 0 ? void 0 : _b.viewType) === 'simple';
}
export function isVisynDataViewDesc(desc) {
    var _a;
    return isVisynViewPluginDesc(desc) && ((_a = desc) === null || _a === void 0 ? void 0 : _a.visynViewType) === 'data';
}
export function isVisynDataView(plugin) {
    var _a, _b;
    return isVisynViewPluginDesc((_a = plugin) === null || _a === void 0 ? void 0 : _a.desc) && ((_b = plugin) === null || _b === void 0 ? void 0 : _b.viewType) === 'data';
}
//# sourceMappingURL=utils.js.map