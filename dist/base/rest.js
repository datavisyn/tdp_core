import { Ajax, AppContext } from 'visyn_core/base';
/**
 * Define empty filter object for use as function default parameter
 */
const emptyFilters = {
    normal: {},
    lt: {},
    lte: {},
    gt: {},
    gte: {},
};
export class RestBaseUtils {
    static getTDPDataImpl(database, view, method, params = {}) {
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
    static prefixFilter(params, prefix = 'filter') {
        const r = {};
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
    static mergeParamAndAllFilters(params, filters) {
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
    static getTDPDesc(database, view) {
        return RestBaseUtils.getTDPDataImpl(database, view, 'desc');
    }
    static getTDPDatabases() {
        return AppContext.getInstance().getAPIJSON(`${RestBaseUtils.REST_DB_NAMESPACE}/`);
    }
    static getTDPViews(database) {
        return AppContext.getInstance().getAPIJSON(`${RestBaseUtils.REST_DB_NAMESPACE}/${database}/`);
    }
    /**
     * return the website url based on the registered proxy page
     * @param {string} proxy proxy page identifier
     * @param args additional arguments
     * @returns {string} the url to the used for iframes
     */
    static getProxyUrl(proxy, args) {
        return AppContext.getInstance().api2absURL(`${RestBaseUtils.REST_NAMESPACE}/proxy/${proxy}`, args);
    }
    static getTDPProxyData(proxy, args, type = 'json') {
        return AppContext.getInstance().getAPIData(`${RestBaseUtils.REST_NAMESPACE}/proxy/${proxy}`, args, type);
    }
    /**
     * query the TDP rest api to read data
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @returns {Promise<T[]>}
     */
    static getTDPData(database, view, params = {}) {
        return RestBaseUtils.getTDPDataImpl(database, view, 'none', params);
    }
    /**
     * query the TDP rest api to read data
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @returns {Promise<IRow[]>}
     */
    static getTDPRows(database, view, params = {}) {
        return RestBaseUtils.getTDPDataImpl(database, view, 'none', params);
    }
    /**
     * Merges the "regular" parameters with filter parameters for the URL.
     * Filter parameters are prefixed accordingly to be accepted by the backend.
     *
     * @param params URL parameters
     * @param filters URL filter parameters
     */
    static mergeParamAndFilters(params, filters) {
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
    static getTDPFilteredRows(database, view, params, filters) {
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
    static getTDPFilteredRowsWithLessGreater(database, view, params, filters = emptyFilters) {
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
    static getTDPScore(database, view, params = {}, filters = {}) {
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
    static getTDPScoreWithLessGreater(database, view, params = {}, filters = emptyFilters) {
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
    static getTDPCount(database, view, params = {}, filters = {}) {
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
    static getTDPCountWithLessGreater(database, view, params = {}, filters = emptyFilters) {
        return RestBaseUtils.getTDPDataImpl(database, view, 'count', RestBaseUtils.mergeParamAndAllFilters(params, filters));
    }
    static getTDPLookupUrl(database, view, params = {}) {
        return AppContext.getInstance().api2absURL(`${RestBaseUtils.REST_DB_NAMESPACE}/${database}/${view}/lookup`, params);
    }
    /**
     * lookup utility function as used for auto completion within select2 form elements
     * @param {string} database the database connector key
     * @param {string} view the view id
     * @param {IParams} params additional parameters
     * @returns {Promise<Readonly<ILookupResult>>}
     */
    static getTDPLookup(database, view, params = {}) {
        return RestBaseUtils.getTDPDataImpl(database, view, 'lookup', params);
    }
}
RestBaseUtils.REST_NAMESPACE = '/tdp';
RestBaseUtils.REST_DB_NAMESPACE = `${RestBaseUtils.REST_NAMESPACE}/db`;
//# sourceMappingURL=rest.js.map