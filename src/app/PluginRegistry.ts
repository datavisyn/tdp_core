import { merge, isObject } from 'lodash';
import type { IPluginDesc, IRegistry, IPlugin } from '../base/plugin';
import { UniqueIdManager } from './UniqueIdManager';
import { EXTENSION_POINT_VISYN_VIEW } from '../base/extensions';
import type { VisynViewPluginDesc, VisynViewPluginType } from '../views/visyn/interfaces';

export class PluginRegistry implements IRegistry {
  private registry: IPluginDesc[] = [];

  public push(type: string, loader: () => any, desc?: any): void;
  public push(type: string, id: string, loader: () => any, desc?: any): void;
  public push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any): void;
  public push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any) {
    const id = typeof idOrLoader === 'string' ? <string>idOrLoader : UniqueIdManager.getInstance().uniqueString(type);
    const loader = typeof idOrLoader === 'string' ? <() => any>descOrLoader : <() => any>descOrLoader;
    const p: IPluginDesc = merge(
      {
        type,
        id,
        name: id,
        factory: 'create',
        description: '',
        version: '1.0.0',
        load: async (): Promise<IPlugin> => {
          const instance = await Promise.resolve(loader());
          if (p.factory) {
            return { desc: p, factory: PluginRegistry.getInstance().getFactoryMethod(instance, p.factory) };
          }
          // If no factory was given, and the instance is an object, use it as factory object.
          if (isObject(instance)) {
            return { ...instance, desc: p, factory: () => null };
          }
          // If nothing matches, return the instance by the factory function
          return { desc: p, factory: () => instance };
        },
      },
      typeof descOrLoader === 'function' ? desc : descOrLoader,
    );

    PluginRegistry.getInstance().registry.push(p);
  }

  /**
   * Push a visyn view to the registry.
   */
  public pushVisynView<Plugin extends VisynViewPluginType>(
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
    desc: Plugin['partialDesc'],
  ): void {
    return this.push(EXTENSION_POINT_VISYN_VIEW, id, (...args: any[]) => loader().then((callable) => callable(...args)), {
      ...desc,
      // Override the load to return the plugin directly instead of the factory function
      factory: null,
    });
  }

  private knownPlugins = new Set<string>();

  public register(plugin: string, generator?: (registry: IRegistry) => void) {
    if (typeof generator !== 'function') {
      // wrong type - not a function, maybe a dummy inline
      return;
    }
    if (PluginRegistry.getInstance().knownPlugins.has(plugin)) {
      return; // don't call it twice
    }
    PluginRegistry.getInstance().knownPlugins.add(plugin);

    generator(PluginRegistry.getInstance());
  }

  /**
   * returns a list of matching plugin descs
   * @param filter
   * @returns {IPluginDesc[]}
   */
  public listPlugins(filter: string | ((desc: IPluginDesc) => boolean) = () => true) {
    if (typeof filter === 'string') {
      const v = filter;
      filter = (desc) => desc.type === v;
    }
    return PluginRegistry.getInstance().registry.filter(<any>filter);
  }

  /**
   * returns an extension identified by type and id
   * @param type
   * @param id
   * @returns {IPluginDesc}
   */
  public getPlugin(type: 'visynView', id: string): VisynViewPluginDesc;
  public getPlugin(type: string, id: string): IPluginDesc;
  public getPlugin(type: string, id: string): IPluginDesc {
    return PluginRegistry.getInstance().registry.find((d) => d.type === type && d.id === id);
  }

  public loadPlugin(desc: IPluginDesc[]) {
    return Promise.all(desc.map((d) => d.load()));
  }

  /**
   * Helper function to simplify importing of  resource files (e.g., JSON).
   * The imported resource file is returned as it is.
   *
   * @param data Imported JSON file
   */
  public asResource(data: any) {
    return {
      create: () => data,
    };
  }

  /**
   * determines the factory method to use in case of the 'new ' syntax wrap the class constructor using a factory method
   */
  public getFactoryMethod(instance: any, factory: string | null) {
    if (factory == null) {
      return instance;
    }
    let f = factory.trim();

    if (f === 'new') {
      // instantiate the default class
      f = 'new default';
    }
    if (f === 'create') {
      // default value
      if (typeof instance.create === 'function') {
        // default exists
        return instance.create;
      }
      // try another default
      if (typeof instance.default === 'function') {
        // we have a default export
        if (instance.default.prototype !== undefined) {
          // it has a prototype so guess it is a class
          f = 'new default';
        } else {
          f = 'default';
        }
      } else {
        console.error(`neither a default export nor the 'create' method exists in the module:`, instance);
      }
    }
    if (f.startsWith('new ')) {
      const className = f.substring('new '.length);
      return (...args: any[]) => new instance[className](...args);
    }
    return instance[f];
  }

  /**
   * Removes all registered plugins if no custom remove function is provided.
   * @param remove Custom function to remove only specific plugins.
   * @example
   *
   * removePlugins((desc)=>desc.type === "tdpView");
   * // => removes all plugins of type "tdpView"
   *
   */
  public removePlugins<T extends IPluginDesc>(remove: (desc: T) => boolean = () => false) {
    this.registry = this.registry.filter((d) => !remove(<T>d));
  }

  private static instance: PluginRegistry;

  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }

    return PluginRegistry.instance;
  }
}
