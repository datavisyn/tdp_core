import { isFunction } from 'lodash';
import { EXTENSION_POINT_VISYN_VIEW } from '../../base/extensions';
/**
 * Utility function to create a plugin loader function from a module and the plugin location.
 * Returns a function passing all parameters to the resolved property.
 * @param pluginLoader Plugin loader function to be wrapped, i.e. `import('./View').then((m) => m.createView)`
 */
export function wrapVisynViewLoader(pluginLoader) {
    return (...args) => pluginLoader.then((callable) => callable(...args));
}
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
//# sourceMappingURL=utils.js.map