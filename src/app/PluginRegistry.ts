import {IPluginDesc, IRegistry, IPlugin} from '../base/plugin';
import {UniqueIdManager} from './UniqueIdManager';
import {BaseUtils} from '../base/BaseUtils';


export class PluginRegistry implements IRegistry {

  private registry: IPluginDesc[] = [];

  public push(type: string, idOrLoader: string | (() => any), descOrLoader: any, desc?: any) {
    const id = typeof idOrLoader === 'string' ? <string>idOrLoader : UniqueIdManager.getInstance().uniqueString(type);
    const loader = typeof idOrLoader === 'string' ? <() => any>descOrLoader : <() => any>descOrLoader;
    const p: IPluginDesc = BaseUtils.mixin({
      type,
      id,
      name: id,
      factory: 'create',
      description: '',
      version: '1.0.0',
      load: async (): Promise<IPlugin> => {
        const instance = await Promise.resolve(loader());
        return {desc: p, factory: PluginRegistry.getInstance().getFactoryMethod(instance, p.factory)};
      }
    }, typeof descOrLoader === 'function' ? desc : descOrLoader);

    PluginRegistry.getInstance().registry.push(p);
  }

  private knownPlugins = new Set<string>();

  public register(plugin: string, generator?: (registry: IRegistry) => void) {
    if (typeof generator !== 'function') {
      //wrong type - not a function, maybe a dummy inline
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
  public listPlugins(filter: (string | ((desc: IPluginDesc) => boolean)) = () => true) {
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
      create: () => data
    };
  }


  /**
   * determines the factory method to use in case of the 'new ' syntax wrap the class constructor using a factory method
   */
  public getFactoryMethod(instance: any, factory: string) {
    let f = factory.trim();

    if (f === 'new') {
      //instantiate the default class
      f = 'new default';
    }
    if (f === 'create') { //default value
      if (typeof instance.create === 'function') {
        //default exists
        return instance.create;
      }
      // try another default
      if (typeof instance.default === 'function') {
        //we have a default export
        if (instance.default.prototype !== undefined) { // it has a prototype so guess it is a class
          f = 'new default';
        } else {
          f = 'default';
        }
      } else {
        console.error(`neighter a default export nor the 'create' method exists in the module:`, instance);
      }
    }
    if (f.startsWith('new ')) {
      const className = f.substring('new '.length);
      return (...args: any[]) => new instance[className](...args);
    }
    return instance[f];
  }


  private static instance: PluginRegistry;
  public static getInstance(): PluginRegistry {
    if (!PluginRegistry.instance) {
      PluginRegistry.instance = new PluginRegistry();
    }

    return PluginRegistry.instance;
  }

}
