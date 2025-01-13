import { IDataDescription } from './DataDescription';
import { IDataType } from './datatype';
export interface INode {
    readonly name: string;
    readonly children: INode[];
    data: IDataType;
}
export declare class DataCache {
    private available;
    private cacheById;
    private cacheByName;
    private cacheByFQName;
    clearCache(dataset?: IDataType | IDataDescription): void;
    private getCachedEntries;
    private cached;
    /**
     * create an object out of a description
     * @param desc
     * @returns {*}
     */
    private transformEntry;
    /**
     * returns a promise for getting a map of all available data
     * @param filter optional filter either a function or a server side interpretable filter object
     * @returns {Promise<IDataType[]>}
     */
    list(filter?: {
        [key: string]: string;
    } | ((d: IDataType) => boolean)): Promise<IDataType[]>;
    /**
     * converts a given list of datasets to a tree
     * @param list
     * @returns {{children: Array, name: string, data: null}}
     */
    convertToTree(list: IDataType[]): INode;
    /**
     * returns a tree of all available datasets
     */
    tree(filter?: {
        [key: string]: string;
    } | ((d: IDataType) => boolean)): Promise<INode>;
    /**
     * Returns the first dataset matching the given query
     * @param query
     * @returns {any}
     */
    getFirst(query: {
        [key: string]: string;
    } | string | RegExp): Promise<IDataType>;
    getFirstByName(name: string | RegExp): Promise<IDataType>;
    getFirstByFQName(name: string | RegExp): Promise<IDataType>;
    private getFirstWithCache;
    /**
     * Returns a promise for getting dataset based on a specific ID.
     * @param id the ID, as defined in IDataDescriptionData#id
     * @returns {Promise<any>}
     */
    private getById;
    /**
     * Returns a promise for getting a specific dataset
     * @param a persisted id or persisted object containing the id
     * @returns {Promise<IDataType>}
     */
    get(persisted: any | string): Promise<IDataType>;
    /**
     * creates a new dataset for the given description
     * @param desc
     * @returns {Promise<IDataType>}
     */
    create(desc: IDataDescription): Promise<IDataType>;
    private prepareData;
    /**
     * uploads a given dataset description with optional file attachment ot the server
     * @param data
     * @param file
     * @returns {Promise<*>}
     */
    upload(data: any, file?: File): Promise<IDataType>;
    /**
     * updates an existing dataset with a new description and optional file
     * @returns {Promise<*>} returns the update dataset
     */
    update(entry: IDataType, data: any, file?: File): Promise<IDataType>;
    /**
     * modifies an existing dataset with a new description and optional file, the difference to update is that this should be used for partial changes
     * @returns {Promise<*>} returns the update dataset
     */
    modify(entry: IDataType, data: any, file?: File): Promise<IDataType>;
    /**
     * removes a given dataset
     * @param entry
     * @returns {Promise<boolean>}
     */
    remove(entry: IDataType | IDataDescription): Promise<boolean>;
    private static instance;
    static getInstance(): DataCache;
}
//# sourceMappingURL=DataCache.d.ts.map