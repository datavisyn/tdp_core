import * as React from 'react';
import { isFunction } from 'lodash';
import { VisynViewPluginDesc, VisynSimpleViewPluginType, VisynDataViewPluginType, VisynViewPlugin } from './interfaces';
import { EXTENSION_POINT_VISYN_VIEW } from '../../base/extensions';

/**
 * Resolves the current value of a setStateAction by calling it with the current value if it is a function,
 * or by simply returning the value otherwise.
 * @param valueOrFunction Value or function to the value.
 * @param currentValue Current value passed to the function to receive the new value.
 */
export function setStateActionCaller<T>(valueOrFunction: React.SetStateAction<T>, currentValue: T) {
  if (isFunction(valueOrFunction)) {
    return valueOrFunction(currentValue);
  }
  return valueOrFunction;
}

export function isVisynViewPluginDesc(desc: unknown): desc is VisynViewPluginDesc {
  return (<any>desc)?.type === EXTENSION_POINT_VISYN_VIEW;
}

export function isVisynSimpleViewDesc(desc: unknown): desc is VisynSimpleViewPluginType['desc'] {
  return isVisynViewPluginDesc(desc) && (<any>desc)?.visynViewType === 'simple';
}

export function isVisynSimpleView(plugin: unknown): plugin is VisynSimpleViewPluginType['plugin'] {
  return isVisynViewPluginDesc((<any>plugin)?.desc) && (<any>plugin)?.viewType === 'simple';
}

export function isVisynDataViewDesc(desc: unknown): desc is VisynDataViewPluginType['desc'] {
  return isVisynViewPluginDesc(desc) && (<any>desc)?.visynViewType === 'data';
}

export function isVisynDataView(plugin: unknown): plugin is VisynDataViewPluginType['plugin'] {
  return isVisynViewPluginDesc((<any>plugin)?.desc) && (<any>plugin)?.viewType === 'data';
}
