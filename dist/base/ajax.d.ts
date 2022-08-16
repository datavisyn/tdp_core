export declare class AjaxError extends Error {
    readonly response: Response;
    constructor(response: Response, message?: string);
}
export declare function isAjaxError(error: any): error is AjaxError;
export declare class Ajax {
    static GLOBAL_EVENT_AJAX_PRE_SEND: string;
    static GLOBAL_EVENT_AJAX_POST_SEND: string;
    /**
     * Maximum number of characters of a valid URL
     */
    static MAX_URL_LENGTH: number;
    /**
     * Tries to get a proper message from a response by checking the `json()` content for `detail`, the `text()`, or the `statusText`.
     * @param response Response where the error message is contained.
     * @returns The extracted error message.
     */
    static getErrorMessageFromResponse(response: Response): Promise<string>;
    static checkStatus(response: Response): Promise<Response>;
    static parseType(expectedDataType: string, response: Response): Promise<any>;
    /**
     * sends an XML http request to the server
     * @param url url
     * @param data arguments
     * @param method the http method
     * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
     * @param requestBody body mime type, default auto derive
     * @returns {Promise<any>}
     */
    static send<T = any>(url: string, data?: any, method?: string, expectedDataType?: string, requestBody?: string, options?: Partial<RequestInit>): Promise<T>;
    /**
     * to get some ajax json file
     * @param url
     * @param data
     * @returns {any}
     */
    static getJSON(url: string, data?: any): Promise<any>;
    /**
     * get some generic data via ajax
     * @param url
     * @param data
     * @param expectedDataType
     * @returns {any}
     */
    static getData(url: string, data?: any, expectedDataType?: string): Promise<any>;
    /**
     * convert a given object to url data similar to JQuery
     * @param data
     * @returns {any}
     */
    static encodeParams(data?: any): string;
}
//# sourceMappingURL=ajax.d.ts.map