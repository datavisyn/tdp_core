import { ICategory } from 'lineupjs';
import { IDTypeLike } from 'visyn_core/idtype';
import { Ajax } from './ajax';
import { AppContext } from '../app';
import { IScoreRow } from './interfaces';

/**
 * common interface for a row as used in LineUp
 */
export interface IRow {
  /**
   * id, e.g. ESNGxxxx
   */
  readonly id: string;

  [key: string]: any;
}

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
  queries?: { [name: string]: string };
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

/**
 * Define empty filter object for use as function default parameter
 */
const emptyFilters: IAllFilters = {
  normal: {},
  lt: {},
  lte: {},
  gt: {},
  gte: {},
};

export interface ILookupItem {
  _id?: never;
  id: string;
  text: string;
}

export interface ILookupResult {
  items: ILookupItem[];
  more: boolean;
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
   * Compliant with https://github.com/lineupjs/lineupjs/blob/fad387fc892753ca819ea1a6b21b6568891c806e/src/model/ICategoricalColumn.ts#L7
   */
  categories?: (string | Partial<ICategory>)[];

  /**
   * the minimal value in case of type=number
   */
  min?: number;

  /**
   * the maxmial value in case of type=number
   */
  max?: number;
}

export class RestBaseUtils {
  public static readonly REST_NAMESPACE = '/tdp';

  public static readonly REST_DB_NAMESPACE = `${RestBaseUtils.REST_NAMESPACE}/db`;

  private static getTDPDataImpl(database: string, view: string, method: 'none' | 'filter' | 'desc' | 'score' | 'count' | 'lookup', params: IParams = {}) {
    const mmethod = method === 'none' ? '' : `/${method}`;
    const url = `${RestBaseUtils.REST_DB_NAMESPACE}/${database}/${view}${mmethod}`;
    const encoded = Ajax.encodeParams(params);
    if (encoded && url.length + encoded.length > Ajax.MAX_URL_LENGTH) {
      // use post instead
      return AppContext.getInstance().sendAPI(url, params, 'POST');
    }
    return AppContext.getInstance().getAPIJSON(url, params);
  }

  /**
   * Add a prefix to the keys of all given URL parameters
   * @param params URL parameter
   * @param prefix The prefix for the parameter keys (default is `filter`)
   */
  private static prefixFilter(params: IParams, prefix = 'filter') {
    const r: IParams = {};
    Object.keys(params).map((key) => (r[key.startsWith(`${prefix}_`) ? key : `${prefix}_${key}`] = params[key]));
    return r;
  }

  /**
   * Merges the "regular" parameters with filter parameters for the URL.
   * Filter parameters are prefixed accordingly to be accepted by the backend.
   *
   * @param params URL parameters
   * @param filters URL filter parameters
   */
  private static mergeParamAndAllFilters(params: IParams, filters: IAllFilters) {
    const normal = RestBaseUtils.prefixFilter(filters.normal);
    const lt = RestBaseUtils.prefixFilter(filters.lt, 'filter_lt');
    const lte = RestBaseUtils.prefixFilter(filters.lte, 'filter_lte');
    const gt = RestBaseUtils.prefixFilter(filters.gt, 'filter_gt');
    const gte = RestBaseUtils.prefixFilter(filters.gte, 'filter_gte');

    return { ...params, ...normal, ...lt, ...lte, ...gt, ...gte };
  }

  /**
   * queries the server side column information of the given view
   * @param {string} database
   * @param {string} view
   * @returns {Promise<Readonly<IDatabaseViewDesc>>}
   */
  static getTDPDesc(database: string, view: string): Promise<Readonly<IDatabaseViewDesc>> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'desc');
  }

  static getTDPDatabases(): Promise<IDatabaseDesc[]> {
    return AppContext.getInstance().getAPIJSON(`${RestBaseUtils.REST_DB_NAMESPACE}/`);
  }

  static getTDPViews(database: string): Promise<Readonly<IDatabaseViewDesc>[]> {
    return AppContext.getInstance().getAPIJSON(`${RestBaseUtils.REST_DB_NAMESPACE}/${database}/`);
  }

  /**
   * return the website url based on the registered proxy page
   * @param {string} proxy proxy page identifier
   * @param args additional arguments
   * @returns {string} the url to the used for iframes
   */
  static getProxyUrl(proxy: string, args: any) {
    return AppContext.getInstance().api2absURL(`${RestBaseUtils.REST_NAMESPACE}/proxy/${proxy}`, args);
  }

  static getTDPProxyData(proxy: string, args: any, type = 'json') {
    return AppContext.getInstance().getAPIData(`${RestBaseUtils.REST_NAMESPACE}/proxy/${proxy}`, args, type);
  }

  /**
   * query the TDP rest api to read data
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @returns {Promise<T[]>}
   */
  static getTDPData<T>(database: string, view: string, params: IParams = {}): Promise<T[]> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'none', params);
  }

  /**
   * query the TDP rest api to read data
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @returns {Promise<IRow[]>}
   */
  static getTDPRows(database: string, view: string, params: IParams = {}): Promise<IRow[]> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'none', params);
  }

  /**
   * Merges the "regular" parameters with filter parameters for the URL.
   * Filter parameters are prefixed accordingly to be accepted by the backend.
   *
   * @param params URL parameters
   * @param filters URL filter parameters
   */
  static mergeParamAndFilters(params: IParams, filters: IParams) {
    return { ...params, ...RestBaseUtils.prefixFilter(filters) };
  }

  /**
   * query the TDP rest api to read data with additional given filters
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @param {IParams} filters filters to use
   * @returns {Promise<IRow[]>}
   */
  static getTDPFilteredRows(database: string, view: string, params: IParams, filters: IParams): Promise<IRow[]> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'filter', RestBaseUtils.mergeParamAndFilters(params, filters));
  }

  /**
   * query the TDP rest api to read data with additional given filters
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @param {IAllFilters} filters object that contains all filter options
   * @returns {Promise<IRow[]>}
   */
  static getTDPFilteredRowsWithLessGreater(database: string, view: string, params: IParams, filters: IAllFilters = emptyFilters): Promise<IRow[]> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'filter', RestBaseUtils.mergeParamAndAllFilters(params, filters));
  }

  /**
   * query the TDP rest api to read a score
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @param {IParams} filters filters to use
   * @returns {Promise<IScoreRow<T>[]>}
   */
  static getTDPScore<T>(database: string, view: string, params: IParams = {}, filters: IParams = {}): Promise<IScoreRow<T>[]> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'score', RestBaseUtils.mergeParamAndFilters(params, filters));
  }

  /**
   * query the TDP rest api to read a score
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @param {IAllFilters} filters object that contains all filter options
   * @returns {Promise<IScoreRow<T>[]>}
   */
  static getTDPScoreWithLessGreater<T>(database: string, view: string, params: IParams = {}, filters: IAllFilters = emptyFilters): Promise<IScoreRow<T>[]> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'score', RestBaseUtils.mergeParamAndAllFilters(params, filters));
  }

  /**
   * query the TDP rest api to compute the number of rows matching this query
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @param {IParams} filters filters to use
   * @returns {Promise<number>}
   */
  static getTDPCount(database: string, view: string, params: IParams = {}, filters: IParams = {}): Promise<number> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'count', RestBaseUtils.mergeParamAndFilters(params, filters));
  }

  /**
   * query the TDP rest api to compute the number of rows matching this query
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @param {IAllFilters} filters object that contains all filter options
   * @returns {Promise<number>}
   */
  static getTDPCountWithLessGreater(database: string, view: string, params: IParams = {}, filters: IAllFilters = emptyFilters): Promise<number> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'count', RestBaseUtils.mergeParamAndAllFilters(params, filters));
  }

  static getTDPLookupUrl(database: string, view: string, params: IParams = {}) {
    return AppContext.getInstance().api2absURL(`${RestBaseUtils.REST_DB_NAMESPACE}/${database}/${view}/lookup`, params);
  }

  /**
   * lookup utility function as used for auto completion within select2 form elements
   * @param {string} database the database connector key
   * @param {string} view the view id
   * @param {IParams} params additional parameters
   * @returns {Promise<Readonly<ILookupResult>>}
   */
  static getTDPLookup(database: string, view: string, params: IParams = {}): Promise<Readonly<ILookupResult>> {
    return RestBaseUtils.getTDPDataImpl(database, view, 'lookup', params);
  }
}
