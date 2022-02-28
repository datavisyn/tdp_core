import type { IPluginDesc, IRegistry, IPlugin } from '../base/plugin';
import type { IBaseViewPluginDesc, IVisynViewPluginDesc } from '../base/interfaces';
export declare class PluginRegistry implements IRegistry {
    private registry;
    pushVisynView(id: string, loader: () => Promise<any>, desc: IBaseViewPluginDesc): void;
    push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any): void;
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
    getVisynPlugin(type: 'visynView', id: string): IVisynViewPluginDesc;
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
    getFactoryMethod(instance: any, factory: string): any;
    private static instance;
    static getInstance(): PluginRegistry;
}
//# sourceMappingURL=PluginRegistry.d.ts.map