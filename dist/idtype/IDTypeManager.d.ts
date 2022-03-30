import { IDType, IDTypeLike, IPersistedIDType } from './IDType';
import { IPluginDesc } from '../base/plugin';
export declare class IDTypeManager {
    static EXTENSION_POINT_IDTYPE: string;
    static EVENT_REGISTER_IDTYPE: string;
    private cache;
    private filledUp;
    private fillUpData;
    private toPlural;
    resolveIdType(id: IDTypeLike): IDType;
    /**
     * list currently resolved idtypes
     * @returns {Array<IDType>}
     */
    listIdTypes(): IDType[];
    /**
     * Get a list of all IDTypes available on both the server and the client.
     * @returns {any}
     */
    listAllIdTypes(): Promise<IDType[]>;
    registerIdType(id: string, idtype: IDType): IDType;
    persistIdTypes(): {};
    restoreIdType(persisted: {
        [key: string]: IPersistedIDType;
    }): void;
    clearSelection(type?: string): void;
    /**
     * whether the given idtype is an internal one or not, i.e. the internal flag is set or it starts with an underscore
     * @param idtype
     * @return {boolean}
     */
    isInternalIDType(idtype: IDType): boolean;
    /**
     * search for all matching ids for a given pattern
     * @param pattern
     * @param limit maximal number of results
     * @return {Promise<void>}
     */
    searchMapping(idType: IDType, pattern: string, toIDType: string | IDType, limit?: number): Promise<{
        match: string;
        to: string;
    }[]>;
    /**
     * returns the list of idtypes that this type can be mapped to
     * @returns {Promise<IDType[]>}
     */
    getCanBeMappedTo(idType: IDType): Promise<IDType[]>;
    mapOneNameToFirstName(idType: IDType, name: string, toIDtype: IDTypeLike): Promise<string>;
    mapOneNameToName(idType: IDType, name: string, toIDtype: IDTypeLike): Promise<string[]>;
    mapNameToFirstName(idType: IDType, names: string[], toIDtype: IDTypeLike): Promise<string[]>;
    mapNameToName(idType: IDType, names: string[], toIDtype: IDTypeLike): Promise<string[][]>;
    findMappablePlugins(target: IDType, all: IPluginDesc[]): any[] | Promise<IPluginDesc[]>;
    init(): void;
    private static instance;
    static getInstance(): IDTypeManager;
}
//# sourceMappingURL=IDTypeManager.d.ts.map