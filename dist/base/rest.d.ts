import { IDTypeLike } from 'visyn_core';
import { IRow, IServerColumn } from 'visyn_core';
import { IScoreRow } from './interfaces';
export type { IRow, IServerColumn } from 'visyn_core';
/**
 * Describes the properties returned for each database connector
 */
export interface IDatabaseDesc {
    /**
     *  name of the db connector (defined for a connector in the __init__.py function)
     */
    readonly name: string;
    /**
     * Description of the connector. Empty string if not set server-side.
     */
    readonly description: string;
}
export interface IServerColumnDesc {
    /**
     * idType of the DBView, can be null
     */
    idType: IDTypeLike | null;
    /**
     * list of columns within this view, can be empty
     */
    columns: IServerColumn[];
}
export interface IDatabaseViewDesc extends IServerColumnDesc {
    name: string;
    description: string;
    arguments: string[];
    query: string;
    filters?: string[];
    queries?: {
        [name: string]: string;
    };
}
export interface IParams {
    [key: string]: string | number | boolean | string[] | number[] | boolean[];
}
/**
 * Interface that contains all possible filters for the database API
 */
export interface IAllFilters {
    /**
     * column values have to be equal to the filter value (string, numerical)
     */
    normal: IParams;
    /**
     * less than filter, column values have to be lower than the filter value (numerical only)
     */
    lt: IParams;
    /**
     * less than equlas filter, column values have to be lower or equal to the filter value (numerical only)
     */
    lte: IParams;
    /**
     * greater than filter, column values have to be higher than the filter value (numerical only)
     */
    gt: IParams;
    /**
     * greater than equals filter, column values have to be higher or equal to the filter value (numerical only)
     */
    gte: IParams;
}
export interface ILookupItem {
    _id?: never;
    id: string;
    text: string;
}
export interface ILookupResult {
    items: ILookupItem[];
    more: boolean;
}
export declare class RestBaseUtils {
    static readonly REST_NAMESPACE = "/tdp";
    static readonly REST_DB_NAMESPACE: string;
    private static getTDPDataImpl;
    /**
     * Add a prefix to the keys of all given URL parameters
     * @param params URL parameter
     * @param prefix The prefix for the parameter keys (default is `filter`)
     */
    private static prefixFilter;
    /**
     * Merges the "regular" parameters with filter parameters for the URL.
     * Filter parameters are prefixed accordingly to be accepted by the backend.
     *
     * @param params URL parameters
     * @param filters URL filter parameters
     */
    private static mergeParamAndAllFilters;
    /**
     * queries the server side column information of the given view
     * @param {string} database
     * @param {string} view
     * @returns {Promise<Readonly<IDatabaseViewDesc>>}
     */
    static getTDPDesc(database: string, view: string): Promise<Readonly<IDatabaseViewDesc>>;
    static getTDPDatabases(): Promise<IDatabaseDesc[]>;
    static getTDPViews(database: string): Promise<Readonly<IDatabaseViewDesc>[]>;
    /**
     * return the website url based on the registered proxy page
     * @param {string} proxy proxy page identifier
     * @param args additional arguments
     * @returns {string} the url to the used for iframes
     */
    static getProxyUrl(proxy: string, args: any): string;
    static getTDPProxyData(proxy: string, args: any, type?: string): Promise<any>;
    /**
     * query the TDP rest api to read data
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @returns {Promise<T[]>}
     */
    static getTDPData<T>(database: string, view: string, params?: IParams): Promise<T[]>;
    /**
     * query the TDP rest api to read data
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @returns {Promise<IRow[]>}
     */
    static getTDPRows(database: string, view: string, params?: IParams): Promise<IRow[]>;
    /**
     * Merges the "regular" parameters with filter parameters for the URL.
     * Filter parameters are prefixed accordingly to be accepted by the backend.
     *
     * @param params URL parameters
     * @param filters URL filter parameters
     */
    static mergeParamAndFilters(params: IParams, filters: IParams): {
        [x: string]: string | number | boolean | string[] | number[] | boolean[];
    };
    /**
     * query the TDP rest api to read data with additional given filters
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @param {IParams} filters filters to use
     * @returns {Promise<IRow[]>}
     */
    static getTDPFilteredRows(database: string, view: string, params: IParams, filters: IParams): Promise<IRow[]>;
    /**
     * query the TDP rest api to read data with additional given filters
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @param {IAllFilters} filters object that contains all filter options
     * @returns {Promise<IRow[]>}
     */
    static getTDPFilteredRowsWithLessGreater(database: string, view: string, params: IParams, filters?: IAllFilters): Promise<IRow[]>;
    /**
     * query the TDP rest api to read a score
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @param {IParams} filters filters to use
     * @returns {Promise<IScoreRow<T>[]>}
     */
    static getTDPScore<T>(database: string, view: string, params?: IParams, filters?: IParams): Promise<IScoreRow<T>[]>;
    /**
     * query the TDP rest api to read a score
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @param {IAllFilters} filters object that contains all filter options
     * @returns {Promise<IScoreRow<T>[]>}
     */
    static getTDPScoreWithLessGreater<T>(database: string, view: string, params?: IParams, filters?: IAllFilters): Promise<IScoreRow<T>[]>;
    /**
     * query the TDP rest api to compute the number of rows matching this query
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @param {IParams} filters filters to use
     * @returns {Promise<number>}
     */
    static getTDPCount(database: string, view: string, params?: IParams, filters?: IParams): Promise<number>;
    /**
     * query the TDP rest api to compute the number of rows matching this query
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @param {IAllFilters} filters object that contains all filter options
     * @returns {Promise<number>}
     */
    static getTDPCountWithLessGreater(database: string, view: string, params?: IParams, filters?: IAllFilters): Promise<number>;
    static getTDPLookupUrl(database: string, view: string, params?: IParams): string;
    /**
     * lookup utility function as used for auto completion within select2 form elements
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @returns {Promise<Readonly<ILookupResult>>}
     */
    static getTDPLookup(database: string, view: string, params?: IParams): Promise<Readonly<ILookupResult>>;
}
//# sourceMappingURL=rest.d.ts.map