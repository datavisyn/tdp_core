import * as React from 'react';
import type { IBaseViewPluginDesc } from '../../base/interfaces';
import type { IPluginDesc, IPlugin } from '../../base/plugin';
import type { IServerColumn } from '../../base/rest';
/**
 * Props interface for visyn views.
 */
export interface IVisynViewProps<Desc extends IVisynViewPluginDesc = IVisynViewPluginDesc, Param extends Record<string, any> = Record<string, any>> {
    /**
     * View plugin desc used to initialize this view, usually coming from the `phovea.ts`.
     */
    desc: Desc;
    /**
     * Selection matching the idtype from the desc at `desc.idtype`.
     */
    selection: string[];
    /**
     * Incoming parameters for this visyn view. These parameters are shared among all components of this view, i.e. the view, the header, ... component.
     */
    parameters: Param;
    /**
     * Callback when the selection changed.
     * @param selection New selection.
     */
    onSelectionChanged(selection: React.SetStateAction<string[]>): void;
    /**
     * Callback when the parameters changed.
     * @param parameters New parameters.
     */
    onParametersChanged(parameters: React.SetStateAction<Param>): void;
}
/**
 * View description for visyn views without any dynamic functions like `load()`. Every property of this interface is configurable
 * and is being used as typing for the `pushVisynView` function.
 */
export interface IBaseVisynViewPluginDesc<Props extends IVisynViewProps<any, any> = IVisynViewProps<any, any>> extends IBaseViewPluginDesc, Partial<Omit<IPluginDesc, 'type' | 'id' | 'load'>> {
    /**
     * Type identifier for the visyn view.
     */
    visynViewType: 'simple' | 'data' | string;
    /**
     * Default parameters used for `parameters` of the actual `IVisynViewProps`.
     */
    defaultParameters?: Props['parameters'];
}
/**
 * View description for visyn views.
 */
export interface IVisynViewPluginDesc<Props extends IVisynViewProps<any, any> = IVisynViewProps<any, any>> extends IBaseVisynViewPluginDesc, IPluginDesc {
    /**
     * Loads the actual module/plugin of the visyn view.
     */
    load(): Promise<IVisynViewPlugin<Props>>;
}
/**
 * TODO:
 */
export declare type IVisynViewPlugin<Props extends IVisynViewProps<any, any> = IVisynViewProps<any, any>> = {
    /**
     * TODO:
     */
    desc: IVisynViewPluginDesc<Props>;
    /**
     * Disallow the user of the factory function as it just leads to null for visyn views.
     */
    factory: never;
} & IVisynViewPluginDefinition<Props> & IPlugin;
/**
 * Factory interface for visyn view plugins. This is the type which is expected from the factory function in the registered module/plugin.
 */
export interface IVisynViewPluginDefinition<Props extends IVisynViewProps<any, any> = IVisynViewProps<any, any>> {
    /**
     * Type identifier for the visyn view. This property has to be in sync with `IVisynViewPluginDesc#visynViewType`.
     * Why do we need to define it twice in the desc and factory? This allows us to match it in the plugin registry generic typing
     * and therefore provide type-safe pushes.
     */
    viewType: IVisynViewPluginDesc['visynViewType'];
    /**
     * Default parameters used for `parameters` of the actual `IVisynViewProps`. The `defaultParameters` of the `desc` take precedence.
     */
    defaultParameters: Props['parameters'];
    /**
     * Main view component of this viysn view plugin.
     */
    view: React.LazyExoticComponent<React.ComponentType<Props>> | React.ComponentType<Props>;
    /**
     * Optional header component of this visyn view plugin.
     */
    header?: React.LazyExoticComponent<React.ComponentType<Props>> | React.ComponentType<Props>;
    /**
     * Optional side-tab component of this visyn view plugin.
     */
    tab?: React.LazyExoticComponent<React.ComponentType<Props>> | React.ComponentType<Props>;
}
/**
 * Utilty type grouping the description, plugin and factory type together.
 * Each subtype is uniquely identified by the type-string (i.e. `"simple"`), and the corresponding props.
 * This allows for easy subtyping of visyn view plugins, i.e. by extending props with `anotherProp` like this:
 *
 * ```javascript
 * type ExampleVisynViewPluginType = VisynViewPluginType<'example', IVisynViewProps<any, any> & { anotherProp: string[]; }>;
 * // ...
 * const desc: ExampleVisynViewPluginType['desc'] = null; // <-- get the plugin from the registry
 * desc.load().then((plugin) => {
 *   const factory = plugin.factory();
 *   return <factory.view
 *                        anotherProp={[]} // This property is required as it is defined above in the type.
 *                        desc={desc} onParametersChanged={() => null}
 *                        onSelectionChanged={() => null}
 *                        parameters={{}}
 *                        selection={[]} />;
 * });
 * ```
 */
export interface VisynViewPluginType<Type extends string, Props extends IVisynViewProps<any, any> = IVisynViewProps<any, any>, Desc extends IVisynViewPluginDesc<Props> = IVisynViewPluginDesc<Props>> {
    desc: Desc & {
        visynViewType: Type;
        load(): Promise<VisynViewPluginType<Type, Props, Desc>['desc']>;
    };
    definition: IVisynViewPluginDefinition<Props>;
    plugin: IVisynViewPlugin<Props>;
}
/**
 * Helper type to get properly typed plugin desc, plugin and factory from just the props.
 */
declare type VisynSimpleViewPluginType<Desc extends IVisynViewPluginDesc = IVisynViewPluginDesc, Param extends Record<string, any> = Record<string, any>> = VisynViewPluginType<'simple', IVisynViewProps<Desc, Param>>;
export declare type IVisynSimpleViewPluginDesc = VisynSimpleViewPluginType['desc'];
export declare type IVisynSimpleViewPlugin = VisynSimpleViewPluginType['plugin'];
export declare type IVisynSimpleViewPluginDefinition = VisynSimpleViewPluginType['definition'];
export declare function isVisynSimpleView(desc: IVisynViewPluginDesc<any>): desc is IVisynSimpleViewPluginDesc;
/**
 * Props type for all data backed visyn view. Extends the visyn view props with data and their description.
 */
declare type VisynDataViewPropsType<Desc extends IVisynViewPluginDesc = IVisynViewPluginDesc, Param extends Record<string, any> = Record<string, any>> = IVisynViewProps<Desc, Param> & {
    /**
     * Data array matching the columns defined in the `dataDesc`.
     */
    data: Record<string, any>[];
    /**
     * Data column description describing the given `data`.
     * TODO:: Type to IReprovisynServerColumn when we merge that into tdp_core
     */
    dataDesc: IServerColumn[] | any[];
};
/**
 * Helper type to get properly typed plugin desc, plugin and factory from just the props.
 */
declare type VisynDataViewPluginType<Desc extends IVisynViewPluginDesc = IVisynViewPluginDesc, Param extends Record<string, any> = Record<string, any>> = VisynViewPluginType<'data', VisynDataViewPropsType<Desc, Param>>;
export declare type IVisynDataViewPluginDesc = VisynDataViewPluginType['desc'];
export declare type IVisynDataViewPlugin = VisynDataViewPluginType['plugin'];
export declare type IVisynDataViewPluginDefinition = VisynDataViewPluginType['definition'];
export declare type IVisynDataViewProps<Param extends Record<string, any> = Record<string, any>> = VisynDataViewPropsType<IVisynDataViewPluginDesc, Param>;
export declare function isVisynDataView(desc: IVisynViewPluginDesc<any>): desc is IVisynDataViewPluginDesc;
export {};
//# sourceMappingURL=interfaces.d.ts.map