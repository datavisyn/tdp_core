import type { IPluginDesc, IRegistry, IPlugin } from '../base/plugin';
import type { VisynViewPluginDesc, VisynViewPluginType } from '../views/visyn/interfaces';
export declare class PluginRegistry implements IRegistry {
    private registry;
    push(type: string, loader: () => any, desc?: any): void;
    push(type: string, id: string, loader: () => any, desc?: any): void;
    push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any): void;
    /**
     * Push a visyn view to the registry.
     */
    pushVisynView<Plugin extends VisynViewPluginType>(
    /**
     * Unique ID of the visyn view.
     */
    id: string, 
    /**
     * Loader function for the module.
     */
    loader: () => Promise<(...args: any[]) => Plugin['definition']>, 
    /**
     * View description of the visyn view plugin.
     */
    desc: Plugin['partialDesc']): void;
    private knownPlugins;
    register(plugin: string, generator?: (registry: IRegistry) => void): void;
    /**
     * returns a list of matching plugin descs
     * @param filter
     * @returns {IPluginDesc[]}
     */
    listPlugins(filter?: string | ((desc: IPluginDesc) => boolean)): IPluginDesc[];
    /**
     * returns an extension identified by type and id
     * @param type
     * @param id
     * @returns {IPluginDesc}
     */
    getPlugin(type: 'visynView', id: string): VisynViewPluginDesc;
    getPlugin(type: string, id: string): IPluginDesc;
    loadPlugin(desc: IPluginDesc[]): Promise<IPlugin[]>;
    /**
     * Helper function to simplify importing of  resource files (e.g., JSON).
     * The imported resource file is returned as it is.
     *
     * @param data Imported JSON file
     */
    asResource(data: any): {
        create: () => any;
    };
    /**
     * determines the factory method to use in case of the 'new ' syntax wrap the class constructor using a factory method
     */
    getFactoryMethod(instance: any, factory: string | null): any;
    /**
     * Removes all registered plugins if no custom remove function is provided.
     * @param remove Custom function to remove only specific plugins.
     * @example
     *
     * removePlugins((desc)=>desc.type === "tdpView");
     * // => removes all plugins of type "tdpView"
     *
     */
    removePlugins<T extends IPluginDesc>(remove?: (desc: T) => boolean): void;
    private static instance;
    static getInstance(): PluginRegistry;
}
//# sourceMappingURL=PluginRegistry.d.ts.map