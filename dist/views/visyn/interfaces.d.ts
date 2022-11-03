import * as React from 'react';
import type { IBaseViewPluginDesc } from '../../base/interfaces';
import type { IPlugin } from '../../base/plugin';
import type { IServerColumn } from '../../base/rest';
/**
 * Props interface for visyn views.
 */
declare type VisynViewProps<Param extends Record<string, unknown>> = {
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
};
/**
 * Type for the react components of a visyn view.
 */
declare type VisynViewComponents<Props extends object> = {
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
};
declare type BaseVisynViewDesc<Type extends string, Param extends Record<string, unknown>> = IBaseViewPluginDesc & {
    /**
     * Type identifier for the visyn view.
     */
    visynViewType: Type;
    /**
     * Default parameters used for `parameters` of the actual props.
     */
    defaultParameters?: Param;
    /**
     * Anything custom
     * @deprecated: Avoid using "custom" non-typed properties, as they hinder reusability.
     */
    readonly [key: string]: any;
};
/**
 * Utility type which combines type, params, props and desc together into a single type, which is used by `DefineVisynViewPlugin` to extract all necessary subtypes.
 */
declare type VisynViewPluginBaseType<Type extends string, Param extends Record<string, unknown>, Props extends object, Desc extends object> = {
    /**
     * View description of the visyn view plugin.
     */
    desc: {
        /**
         * Loads the actual module/plugin of the visyn view.
         * TODO: The typing here is actually not really correct, as there is some recursion here. The Desc would need to contain this updated load function for example.
         */
        load(): Promise<VisynViewPluginBaseType<Type, Param, Props, Desc>>;
    } & BaseVisynViewDesc<Type, Param> & Desc;
    /**
     * Type identifier for the visyn view. This property has to be in sync with `desc#visynViewType`.
     * Why do we need to define it twice in the desc and factory? This allows us to match it in the plugin registry generic typing
     * and therefore provide type-safe pushes.
     */
    viewType: Type;
    /**
     * Default parameters used for `parameters` of the actual props. The `defaultParameters` of the `desc` take precedence.
     */
    defaultParameters: Param;
    /**
     * Disallow the user of factory as it is set to `null` by `pushVisynView`.
     */
    factory: never;
} & VisynViewComponents<Props & {
    desc: VisynViewPluginBaseType<Type, Param, Props, Desc>['desc'];
} & VisynViewProps<Param>> & IPlugin;
/**
 * Utility type to define a new visyn view plugin.
 */
export interface DefineVisynViewPlugin<Type extends string, Param extends Record<string, unknown> = Record<string, unknown>, Props extends object = Record<string, unknown>, Desc extends object = Record<string, unknown>> {
    /**
     * Full desc including a properly typed load function.
     * @see VisynViewPluginBaseType#desc
     */
    desc: VisynViewPluginBaseType<Type, Param, Props, Desc>['desc'];
    /**
     * Partial desc for the registration in the phovea.ts. This is used as typing for the desc in the `pushVisynView`.
     */
    partialDesc: BaseVisynViewDesc<Type, Param> & Desc;
    /**
     * Definition to be used as return value of the loader function of the module.
     */
    definition: Pick<VisynViewPluginBaseType<Type, Param, Props, Desc>, 'viewType' | 'defaultParameters' | 'header' | 'view' | 'tab'>;
    /**
     * Full plugin representing the loaded visyn view.
     */
    plugin: VisynViewPluginBaseType<Type, Param, Props, Desc>;
    /**
     * Props for all React components of this plugin.
     */
    props: VisynViewPluginBaseType<Type, Param, Props, Desc> extends VisynViewComponents<infer P> ? P : never;
}
/**
 * Generic visyn view plugin definition with arbitrary type, params, props and desc.
 */
export declare type VisynViewPluginType = DefineVisynViewPlugin<string, Record<string, any>, Record<string, any>, Record<string, any>>;
/**
 * View description for visyn views without any dynamic functions like `load()`. Every property of this interface is configurable
 * and is being used as typing for the `pushVisynView` function.
 */
export declare type VisynViewPluginDesc = VisynViewPluginType['desc'];
export declare type VisynViewPlugin = VisynViewPluginType['plugin'];
/**
 * Plugin type for simple visyn views.
 */
export declare type VisynSimpleViewPluginType<Param extends Record<string, unknown> = Record<string, unknown>, Desc extends Record<string, unknown> = Record<string, unknown>> = DefineVisynViewPlugin<'simple', Param, Record<string, unknown>, Desc>;
/**
 * Plugin type for all data backed visyn views. Extends the visyn view props with data and their description.
 */
export declare type VisynDataViewPluginType<Param extends Record<string, unknown> = Record<string, unknown>, Desc extends Record<string, unknown> = Record<string, unknown>, ColumnDesc = IServerColumn[], Data = Record<string, unknown>[]> = DefineVisynViewPlugin<'data', Param, {
    /**
     * Data array matching the columns defined in the `dataDesc`.
     */
    data: Data;
    /**
     * Data column description describing the given `data`.
     * TODO:: Type to IReprovisynServerColumn when we merge that into tdp_core
     */
    columnDesc: ColumnDesc;
    /**
     * List of items which are filtered out of the view. Ids match the idtype from 'desc.idtype'
     */
    filteredOutIds: string[];
    /**
     * Callback when the Filter changed.
     * @param filteredOutIds New Filter.
     */
    onFilteredOutIdsChanged(filteredOutIds: React.SetStateAction<string[]>): void;
}, Desc>;
export {};
//# sourceMappingURL=interfaces.d.ts.map