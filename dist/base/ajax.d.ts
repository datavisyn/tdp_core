export declare class AjaxError extends Error {
    readonly response: Response;
    constructor(response: Response, message?: string);
}
export declare class Ajax {
    static GLOBAL_EVENT_AJAX_PRE_SEND: string;
    static GLOBAL_EVENT_AJAX_POST_SEND: string;
    /**
     * Maximum number of characters of a valid URL
     */
    static MAX_URL_LENGTH: number;
    static checkStatus(response: Response): Response;
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
    static send(url: string, data?: any, method?: string, expectedDataType?: string, requestBody?: string): Promise<any>;
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
