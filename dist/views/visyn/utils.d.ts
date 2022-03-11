import * as React from 'react';
import { VisynViewPluginDesc, VisynSimpleViewPluginType, VisynDataViewPluginType } from './interfaces';
/**
 * Resolves the current value of a setStateAction by calling it with the current value if it is a function,
 * or by simply returning the value otherwise.
 * @param valueOrFunction Value or function to the value.
 * @param currentValue Current value passed to the function to receive the new value.
 */
export declare function setStateActionCaller<T>(valueOrFunction: React.SetStateAction<T>, currentValue: T): T;
export declare function isVisynViewPluginDesc(desc: unknown): desc is VisynViewPluginDesc;
export declare function isVisynSimpleViewDesc(desc: unknown): desc is VisynSimpleViewPluginType['desc'];
export declare function isVisynSimpleView(plugin: unknown): plugin is VisynSimpleViewPluginType['plugin'];
export declare function isVisynDataViewDesc(desc: unknown): desc is VisynDataViewPluginType['desc'];
export declare function isVisynDataView(plugin: unknown): plugin is VisynDataViewPluginType['plugin'];
//# sourceMappingURL=utils.d.ts.map