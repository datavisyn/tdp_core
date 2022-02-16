import { UniqueIdManager } from './UniqueIdManager';
import { BaseUtils } from '../base/BaseUtils';
import { EXTENSION_POINT_VISYN_VIEW } from '../base/extensions';
export class PluginRegistry {
    constructor() {
        this.registry = [];
        this.knownPlugins = new Set();
    }
    pushVisynView(id, loader, desc) {
        return this.push(EXTENSION_POINT_VISYN_VIEW, id, loader, desc);
    }
    push(type, idOrLoader, descOrLoader, desc) {
        const id = typeof idOrLoader === 'string' ? idOrLoader : UniqueIdManager.getInstance().uniqueString(type);
        const loader = typeof idOrLoader === 'string' ? descOrLoader : descOrLoader;
        const p = BaseUtils.mixin({
            type,
            id,
            name: id,
            factory: 'create',
            description: '',
            version: '1.0.0',
            load: async () => {
                const instance = await Promise.resolve(loader());
                return { desc: p, factory: PluginRegistry.getInstance().getFactoryMethod(instance, p.factory) };
            },
        }, typeof descOrLoader === 'function' ? desc : descOrLoader);
        PluginRegistry.getInstance().registry.push(p);
    }
    register(plugin, generator) {
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
    listPlugins(filter = () => true) {
        if (typeof filter === 'string') {
            const v = filter;
            filter = (desc) => desc.type === v;
        }
        return PluginRegistry.getInstance().registry.filter(filter);
    }
    /**
     * returns an extension identified by type and id
     * @param type
     * @param id
     * @returns {IPluginDesc}
     */
    getVisynPlugin(type, id) {
        return PluginRegistry.getInstance().registry.find((d) => d.type === type && d.id === id);
    }
    getPlugin(type, id) {
        return PluginRegistry.getInstance().registry.find((d) => d.type === type && d.id === id);
    }
    loadPlugin(desc) {
        return Promise.all(desc.map((d) => d.load()));
    }
    /**
     * Helper function to simplify importing of  resource files (e.g., JSON).
     * The imported resource file is returned as it is.
     *
     * @param data Imported JSON file
     */
    asResource(data) {
        return {
            create: () => data,
        };
    }
    /**
     * determines the factory method to use in case of the 'new ' syntax wrap the class constructor using a factory method
     */
    getFactoryMethod(instance, factory) {
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
                }
                else {
                    f = 'default';
                }
            }
            else {
                console.error(`neither a default export nor the 'create' method exists in the module:`, instance);
            }
        }
        if (f.startsWith('new ')) {
            const className = f.substring('new '.length);
            return (...args) => new instance[className](...args);
        }
        return instance[f];
    }
    static getInstance() {
        if (!PluginRegistry.instance) {
            PluginRegistry.instance = new PluginRegistry();
        }
        return PluginRegistry.instance;
    }
}
//# sourceMappingURL=PluginRegistry.js.map