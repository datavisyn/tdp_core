import * as React from 'react';
import { IVisynViewPluginDefinition, IVisynViewPluginDesc } from './interfaces';
import { IPluginDesc } from '../../base/plugin';
/**
 * Utility function to create a plugin loader function from a module and the plugin location.
 * Returns a function passing all parameters to the resolved property.
 * @param pluginLoader Plugin loader function to be wrapped, i.e. `import('./View').then((m) => m.createView)`
 */
export declare function wrapVisynViewLoader<Plugin extends (...args: any[]) => IVisynViewPluginDefinition>(pluginLoader: Promise<Plugin>): (...args: any[]) => Promise<IVisynViewPluginDefinition<import("./interfaces").IVisynViewProps<any, any>>>;
/**
 * Resolves the current value of a setStateAction by calling it with the current value if it is a function,
 * or by simply returning the value otherwise.
 * @param valueOrFunction Value or function to the value.
 * @param currentValue Current value passed to the function to receive the new value.
 */
export declare function setStateActionCaller<T>(valueOrFunction: React.SetStateAction<T>, currentValue: T): T;
export declare function isVisynViewPluginDesc(desc: IPluginDesc): desc is IVisynViewPluginDesc;
//# sourceMappingURL=utils.d.ts.map