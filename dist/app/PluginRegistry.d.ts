import type { IPluginDesc, IRegistry, IPlugin } from '../base/plugin';
import type { IVisynViewPluginDesc, IBaseVisynViewPluginDesc, IVisynViewPluginDefinition } from '../views/visyn/interfaces';
export declare class PluginRegistry implements IRegistry {
    private registry;
    push(type: string, loader: () => any, desc?: any): void;
    push(type: string, id: string, loader: () => any, desc?: any): void;
    push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any): void;
    /**
     * Push a visyn view to the registry.
     */
    pushVisynView<Plugin extends IVisynViewPluginDefinition>(
    /**
     * Unique ID of the visyn view.
     */
    id: string, 
    /**
     * Loader function for the module.
     */
    loader: () => Promise<Plugin>, 
    /**
     * View description of the visyn view plugin.
     */
    desc: IBaseVisynViewPluginDesc & {
        /**
         * View type of the registered view.
         * This property could be inferred by the `viewType` in the actual factory, BUT then we would have to load
         * the plugin to know this, and the desc is known without loading the plugin. Therefore, it is more efficient
         * to define it twice.
         * See `IBaseVisynViewPluginDesc#visynViewType` for details.
         */
        visynViewType: Plugin['viewType'];
    }): void;
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
    getPlugin(type: 'visynView', id: string): IVisynViewPluginDesc;
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
    private static instance;
    static getInstance(): PluginRegistry;
}
//# sourceMappingURL=PluginRegistry.d.ts.map