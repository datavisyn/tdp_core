import {api2absURL, getAPIData, getAPIJSON, encodeParams, sendAPI} from 'phovea_core/src/ajax';
import {IScoreRow} from './lineup';

export const REST_NAMESPACE = '/tdp';
export const REST_DB_NAMESPACE = `${REST_NAMESPACE}/db`;

/**
 * common interface for a row as used in LineUp
 */
export interface IRow {
  /**
   * id, e.g. ESNGxxxx
   */
  readonly id: string;
  /**
   * unique internal number id, e.g. 42
   */
  readonly _id: number;

  [key: string]: any;
}


export function getTDPDatabases(): Promise<string[]> {
  return getAPIJSON(`${REST_DB_NAMESPACE}/`);
}

export interface IViewDesc {
  name: string;
  description: string;
  arguments: string[];
  query: string;
  columns?: IServerColumn[];
  idType?: string;
  filters?: string[];
  queries?: { [name: string]: string };
}

export function getTDPViews(database: string): Promise<Readonly<IViewDesc>[]> {
  return getAPIJSON(`${REST_DB_NAMESPACE}/${database}/`);
}

/**
 * return the website url based on the registered proxy page
 * @param {string} proxy proxy page identifier
 * @param args additional arguments
 * @returns {string} the url to the used for iframes
 */
export function getProxyUrl(proxy: string, args: any) {
  return api2absURL(`${REST_NAMESPACE}/proxy/${proxy}`, args);
}

export function getTDPProxyData(proxy: string, args: any, type: string = 'json') {
  return getAPIData(`${REST_NAMESPACE}/proxy/${proxy}`, args, type);
}

/**
 * Interface that contains all possible filters for the database API
 * @param normal column values have to be equal to the filter value (string, numerical)
 * @param lt less than filter, column values have to be lower than the filter value (numerical only)
 * @param lte less than equlas filter, column values have to be lower or equal to the filter value (numerical only)
 * @param gt greater than filter, column values have to be higher than the filter value (numerical only)
 * @param gte greater than equals filter, column values have to be higher or equal to the filter value (numerical only)
 */
export interface IAllFilters {
  normal: IParams;
  lt: IParams;
  lte: IParams;
  gt: IParams;
  gte: IParams;
}

export interface IParams {
  [key: string]: string | number | boolean | string[] | number[] | boolean[];
}

const TOO_LONG_URL = 4096;

function getTDPDataImpl(database: string, view: string, method: 'none' | 'filter' | 'desc' | 'score' | 'count' | 'lookup', params: IParams = {}, assignIds: boolean = false) {
  const mmethod = method === 'none' ? '' : `/${method}`;
  if (assignIds) {
    params._assignids = true; // assign globally ids on the server side
  }

  const url = `${REST_DB_NAMESPACE}/${database}/${view}${mmethod}`;
  const encoded = encodeParams(params);
  if (encoded && (url.length + encoded.length > TOO_LONG_URL)) {
    // use post instead
    return sendAPI(url, params, 'POST');
  }
  return getAPIJSON(url, params);
}

/**
 * query the TDP rest api to read data
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {boolean} assignIds flag whether the server is supposed to assign ids automatically or not
 * @returns {Promise<T[]>}
 */
export function getTDPData<T>(database: string, view: string, params: IParams = {}, assignIds: boolean = false): Promise<T[]> {
  return getTDPDataImpl(database, view, 'none', params, assignIds);
}

/**
 * query the TDP rest api to read data
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {boolean} assignIds flag whether the server is supposed to assign ids automatically or not
 * @returns {Promise<IRow[]>}
 */
export function getTDPRows(database: string, view: string, params: IParams = {}, assignIds: boolean = false): Promise<IRow[]> {
  return getTDPDataImpl(database, view, 'none', params, assignIds);
}

function prefixFilter(filters: IParams, prefix: string = 'filter') {
  const r: IParams = {};
  Object.keys(filters).map((key) => r[key.startsWith(`${prefix}_`) ? key : `${prefix}_${key}`] = filters[key]);
  return r;
}

function mergeParamAndAllFilters(params: IParams, filters: IAllFilters) {
  const normal = prefixFilter(filters.normal);
  const lt = prefixFilter(filters.lt, 'filter_lt');
  const lte = prefixFilter(filters.lte, 'filter_lte');
  const gt = prefixFilter(filters.gt, 'filter_gt');
  const gte = prefixFilter(filters.gte, 'filter_gte');

  return Object.assign({}, params, normal, lt, lte, gt, gte);
}

export function mergeParamAndFilters(params: IParams, filters: IParams) {
  return Object.assign({}, params, prefixFilter(filters));
}

/**
 * query the TDP rest api to read data with additional given filters
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {IParams} filters filters to use
 * @param {boolean} assignIds flag whether the server is supposed to assign ids automatically or not
 * @returns {Promise<IRow[]>}
 */
export function getTDPFilteredRows(database: string, view: string, params: IParams, filters: IParams, assignIds: boolean = false): Promise<IRow[]> {
  return getTDPDataImpl(database, view, 'filter', mergeParamAndFilters(params, filters), assignIds);
}

/**
 * query the TDP rest api to read data with additional given filters
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {IAllFilters} filters object that contains all filter options: normal, lt (= less than), lte (= less than equals), gt (= greater than), and gte (= greater than equals),
 * @param {boolean} assignIds flag whether the server is supposed to assign ids automatically or not
 * @returns {Promise<IRow[]>}
 */
export function getTDPFilteredRowsWithLessGreater(database: string, view: string, params: IParams, filters: IAllFilters = { normal:{}, lt:{}, lte:{}, gt:{}, gte:{} }, assignIds: boolean = false): Promise<IRow[]> {
  return getTDPDataImpl(database, view, 'filter', mergeParamAndAllFilters(params, filters), assignIds);
}

/**
 * query the TDP rest api to read a score
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {IParams} filters filters to use
 * @returns {Promise<IScoreRow<T>[]>}
 */
export function getTDPScore<T>(database: string, view: string, params: IParams = {}, filters: IParams = {}): Promise<IScoreRow<T>[]> {
  return getTDPDataImpl(database, view, 'score', mergeParamAndFilters(params, filters));
}

/**
 * query the TDP rest api to read a score
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {IAllFilters} filters object that contains all filter options: normal, lt (=less than), lte (=less than equals), gt (=greater than), and gte (=greater than equals),
 * @returns {Promise<IScoreRow<T>[]>}
 */
export function getTDPScoreWithLessGreater<T>(database: string, view: string, params: IParams = {}, filters: IAllFilters = { normal:{}, lt:{}, lte:{}, gt:{}, gte:{} }): Promise<IScoreRow<T>[]> {
  return getTDPDataImpl(database, view, 'score', mergeParamAndAllFilters(params, filters));
}

/**
 * query the TDP rest api to compute the number of rows matching this query
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {IParams} filters filters to use
 * @returns {Promise<number>}
 */
export function getTDPCount(database: string, view: string, params: IParams = {}, filters: IParams = {}): Promise<number> {
  return getTDPDataImpl(database, view, 'count', mergeParamAndFilters(params, filters));
}

/**
 * query the TDP rest api to compute the number of rows matching this query
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {IAllFilters} filters object that contains all filter options: normal, lt (=less than), lte (=less than equals), gt (=greater than), and gte (=greater than equals),
 * @returns {Promise<number>}
 */
export function getTDPCountWithLessGreater(database: string, view: string, params: IParams = {}, filters: IAllFilters = { normal:{}, lt:{}, lte:{}, gt:{}, gte:{} } ): Promise<number> {
  return getTDPDataImpl(database, view, 'count', mergeParamAndAllFilters(params, filters));
}

export interface ILookupItem {
  _id: number;
  id: string;
  text: string;
}

export interface ILookupResult {
  items: ILookupItem[];
  more: boolean;
}

export function getTDPLookupUrl(database: string, view: string, params: IParams = {}) {
  return api2absURL(`${REST_DB_NAMESPACE}/${database}/${view}/lookup`, params);
}
/**
 * lookup utility function as used for auto completion within select2 form elements
 * @param {string} database the database connector key
 * @param {string} view the view id
 * @param {IParams} params additional parameters
 * @param {boolean} assignIds
 * @returns {Promise<Readonly<ILookupResult>>}
 */
export function getTDPLookup(database: string, view: string, params: IParams = {}, assignIds: boolean = false): Promise<Readonly<ILookupResult>> {
  return getTDPDataImpl(database, view, 'lookup', params, assignIds);
}

export interface IServerColumn {
  /**
   * column name to access with the data
   */
  column: string;
  /**
   * label of this column by default the column name
   */
  label: string;
  /**
   * column type
   */
  type: 'categorical' | 'number' | 'string';

  /**
   * the categories in case of type=categorical
   */
  categories?: string[];

  /**
   * the minimal value in case of type=number
   */
  min?: number;

  /**
   * the maxmial value in case of type=number
   */
  max?: number;
}

export interface IViewDescription {
  /**
   * list of columns within this view
   */
  columns: IServerColumn[];
}

/**
 * queries the server side column information of the given view
 * @param {string} database
 * @param {string} view
 * @returns {Promise<Readonly<IViewDescription>>}
 */
export function getTDPDesc(database: string, view: string): Promise<Readonly<IViewDescription>> {
  return getTDPDataImpl(database, view, 'desc');
}
