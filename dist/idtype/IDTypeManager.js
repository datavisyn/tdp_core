import { AppContext } from '../app/AppContext';
import { GlobalEventHandler } from '../base/event';
import { SelectionUtils } from './SelectionUtils';
import { IDType } from './IDType';
import { PluginRegistry } from '../app/PluginRegistry';
export class IDTypeManager {
    constructor() {
        this.cache = new Map();
        this.filledUp = false;
    }
    fillUpData(entries) {
        entries.forEach((row) => {
            let entry = IDTypeManager.getInstance().cache.get(row.id);
            let newOne = false;
            if (entry) {
                if (entry instanceof IDType) {
                    // @ts-ignore
                    entry.name = row.name;
                    // @ts-ignore
                    entry.names = row.names;
                }
            }
            else {
                entry = new IDType(row.id, row.name, row.names);
                newOne = true;
            }
            IDTypeManager.getInstance().cache.set(row.id, entry);
            if (newOne) {
                GlobalEventHandler.getInstance().fire(IDTypeManager.EVENT_REGISTER_IDTYPE, entry);
            }
        });
    }
    toPlural(name) {
        if (name[name.length - 1] === 'y') {
            return `${name.slice(0, name.length - 1)}ies`;
        }
        return `${name}s`;
    }
    resolveIdType(id) {
        if (id instanceof IDType) {
            return id;
        }
        const sid = id;
        return IDTypeManager.getInstance().registerIdType(sid, new IDType(sid, sid, IDTypeManager.getInstance().toPlural(sid)));
    }
    /**
     * list currently resolved idtypes
     * @returns {Array<IDType>}
     */
    listIdTypes() {
        return Array.from(IDTypeManager.getInstance().cache.values());
    }
    /**
     * Get a list of all IDTypes available on both the server and the client.
     * @returns {any}
     */
    async listAllIdTypes() {
        if (IDTypeManager.getInstance().filledUp) {
            return Promise.resolve(IDTypeManager.getInstance().listIdTypes());
        }
        const c = await AppContext.getInstance().getAPIJSON('/idtype/', {}, []);
        IDTypeManager.getInstance().filledUp = true;
        IDTypeManager.getInstance().fillUpData(c);
        return IDTypeManager.getInstance().listIdTypes();
    }
    registerIdType(id, idtype) {
        if (IDTypeManager.getInstance().cache.has(id)) {
            return IDTypeManager.getInstance().cache.get(id);
        }
        IDTypeManager.getInstance().cache.set(id, idtype);
        GlobalEventHandler.getInstance().fire(IDTypeManager.EVENT_REGISTER_IDTYPE, idtype);
        return idtype;
    }
    persistIdTypes() {
        return Array.from(IDTypeManager.getInstance().cache.entries()).reduce((acc, [id, idType]) => ({ ...acc, [id]: idType.persist() }), {});
    }
    restoreIdType(persisted) {
        Object.keys(persisted).forEach((id) => {
            IDTypeManager.getInstance().resolveIdType(id).restore(persisted[id]);
        });
    }
    clearSelection(type = SelectionUtils.defaultSelectionType) {
        IDTypeManager.getInstance().cache.forEach((v) => v.clear(type));
    }
    /**
     * whether the given idtype is an internal one or not, i.e. the internal flag is set or it starts with an underscore
     * @param idtype
     * @return {boolean}
     */
    isInternalIDType(idtype) {
        return idtype.internal || idtype.id.startsWith('_');
    }
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    searchMapping(idType, pattern, toIDType, limit = 10) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDType);
        return AppContext.getInstance().getAPIJSON(`/idtype/${idType.id}/${target.id}/search`, { q: pattern, limit });
    }
    /**
     * returns the list of idtypes that this type can be mapped to
     * @returns {Promise<IDType[]>}
     */
    getCanBeMappedTo(idType) {
        if (idType.canBeMappedTo === null) {
            idType.canBeMappedTo = AppContext.getInstance()
                .getAPIJSON(`/idtype/${idType.id}/`)
                .then((list) => list.map(IDTypeManager.getInstance().resolveIdType));
        }
        return idType.canBeMappedTo;
    }
    async mapOneNameToFirstName(idType, name, toIDtype) {
        return this.mapNameToFirstName(idType, [name], toIDtype).then((names) => names[0]);
    }
    async mapOneNameToName(idType, name, toIDtype) {
        return this.mapNameToName(idType, [name], toIDtype).then((names) => names[0]);
    }
    async mapNameToFirstName(idType, names, toIDtype) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDtype);
        if (idType.id === target.id) {
            return names;
        }
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}`, { q: names, mode: 'first' });
    }
    async mapNameToName(idType, names, toIDtype) {
        const target = IDTypeManager.getInstance().resolveIdType(toIDtype);
        // TODO: Check if this makes sense, what if we have synonyms?
        // if(idType.id === target.id) {
        //   return names.map((name) => [name]);
        // }
        return IDType.chooseRequestMethod(`/idtype/${idType.id}/${target.id}`, { q: names });
    }
    findMappablePlugins(target, all) {
        if (!target) {
            return [];
        }
        const idTypes = Array.from(new Set(all.map((d) => d.idtype)));
        function canBeMappedTo(idtype) {
            if (idtype === target.id) {
                return true;
            }
            // lookup the targets and check if our target is part of it
            return IDTypeManager.getInstance()
                .getCanBeMappedTo(IDTypeManager.getInstance().resolveIdType(idtype))
                .then((mappables) => mappables.some((d) => d.id === target.id));
        }
        // check which idTypes can be mapped to the target one
        return Promise.all(idTypes.map(canBeMappedTo)).then((mappable) => {
            const valid = idTypes.filter((d, i) => mappable[i]);
            return all.filter((d) => valid.indexOf(d.idtype) >= 0);
        });
    }
    init() {
        // register known idtypes via registry
        PluginRegistry.getInstance()
            .listPlugins(IDTypeManager.EXTENSION_POINT_IDTYPE)
            .forEach((plugin) => {
            const { id } = plugin;
            const { name } = plugin;
            const names = plugin.names || this.toPlural(name);
            const internal = Boolean(plugin.internal);
            this.registerIdType(id, new IDType(id, name, names, internal));
        });
    }
    static getInstance() {
        if (!IDTypeManager.instance) {
            IDTypeManager.instance = new IDTypeManager();
            IDTypeManager.instance.init();
        }
        return IDTypeManager.instance;
    }
}
IDTypeManager.EXTENSION_POINT_IDTYPE = 'idType';
IDTypeManager.EVENT_REGISTER_IDTYPE = 'register.idtype';
//# sourceMappingURL=IDTypeManager.js.map