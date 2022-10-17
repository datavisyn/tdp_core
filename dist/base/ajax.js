import { merge } from 'lodash';
import { GlobalEventHandler } from './event';
export class AjaxError extends Error {
    constructor(response, message) {
        super(message || response.statusText);
        this.response = response;
    }
}
export function isAjaxError(error) {
    return error?.response instanceof Response;
}
export class Ajax {
    /**
     * Tries to get a proper message from a response by checking the `json()` content for `detail`, the `text()`, or the `statusText`.
     * @param response Response where the error message is contained.
     * @returns The extracted error message.
     */
    static async getErrorMessageFromResponse(response) {
        // try to get a message from the response, either via json detail, the text, or the status text.
        let message = '';
        try {
            // Read the stream and try to parse it
            const text = await response.text();
            try {
                message = message || JSON.parse(text).detail;
            }
            catch (e) {
                // ignore
            }
            message = message || text;
        }
        catch (e) {
            // ignore
        }
        message = message || response.statusText;
        return message;
    }
    static async checkStatus(response) {
        if (response.ok) {
            return response;
        }
        throw new AjaxError(response, await Ajax.getErrorMessageFromResponse(response));
    }
    static parseType(expectedDataType, response) {
        switch (expectedDataType.trim().toLowerCase()) {
            case 'json':
            case 'application/json':
                return response.json();
            case 'text':
            case 'text/plain':
                return response.text();
            case 'blob':
                return response.blob();
            case 'arraybuffer':
                return response.arrayBuffer();
            default:
                throw new AjaxError(response, `unknown expected data type: "${expectedDataType}"`);
        }
    }
    /**
     * sends an XML http request to the server
     * @param url url
     * @param data arguments
     * @param method the http method
     * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
     * @param requestBody body mime type, default auto derive
     * @returns {Promise<any>}
     */
    static async send(url, data = {}, method = 'GET', expectedDataType = 'json', requestBody = 'formdata', options = {}) {
        // for compatibility
        method = method.toUpperCase();
        // need to encode the body in the url in case of GET and HEAD
        if (method === 'GET' || method === 'HEAD') {
            data = Ajax.encodeParams(data); // encode in url
            if (data) {
                url += (/\?/.test(url) ? '&' : '?') + data;
                data = null;
            }
        }
        const mergedOptions = merge({
            credentials: 'same-origin',
            method,
            headers: {
                Accept: 'application/json',
            },
        }, options);
        if (data) {
            let mimetype = '';
            switch (requestBody.trim().toLowerCase()) {
                case 'json':
                case 'application/json':
                    mimetype = 'application/json';
                    mergedOptions.body = typeof data === 'string' ? data : JSON.stringify(data);
                    break;
                case 'text':
                case 'text/plain':
                    mimetype = 'text/plain';
                    mergedOptions.body = String(data);
                    break;
                case 'blob':
                case 'arraybuffer':
                    mimetype = 'application/octet-stream';
                    mergedOptions.body = data;
                    break;
                default:
                    if (data instanceof FormData) {
                        mergedOptions.body = data;
                    }
                    else {
                        mimetype = 'application/x-www-form-urlencoded';
                        mergedOptions.body = Ajax.encodeParams(data);
                    }
            }
            if (mimetype) {
                mergedOptions.headers['Content-Type'] = mimetype;
            }
        }
        // there are no typings for fetch so far
        GlobalEventHandler.getInstance().fire(Ajax.GLOBAL_EVENT_AJAX_PRE_SEND, url, mergedOptions);
        const r = await Ajax.checkStatus(await window.fetch(url, mergedOptions));
        const output = Ajax.parseType(expectedDataType, r);
        GlobalEventHandler.getInstance().fire(Ajax.GLOBAL_EVENT_AJAX_POST_SEND, url, mergedOptions, r, output);
        return output;
    }
    /**
     * to get some ajax json file
     * @param url
     * @param data
     * @returns {any}
     */
    static getJSON(url, data = {}) {
        return Ajax.send(url, data);
    }
    /**
     * get some generic data via ajax
     * @param url
     * @param data
     * @param expectedDataType
     * @returns {any}
     */
    static getData(url, data = {}, expectedDataType = 'json') {
        return Ajax.send(url, data, 'GET', expectedDataType);
    }
    /**
     * convert a given object to url data similar to JQuery
     * @param data
     * @returns {any}
     */
    static encodeParams(data = null) {
        if (data === null) {
            return null;
        }
        if (typeof data === 'string') {
            return encodeURIComponent(data);
        }
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return null;
        }
        const s = [];
        function add(prefix, key, value) {
            if (Array.isArray(value)) {
                value.forEach((v, i) => {
                    if (typeof v === 'object') {
                        add(prefix, `${key}[${i}]`, v);
                    }
                    else {
                        // primitive values uses the same key
                        add(prefix, `${key}[]`, v);
                    }
                });
            }
            else if (value == null) {
                // skip
            }
            else if (typeof value === 'object') {
                Object.keys(value).forEach((v) => {
                    add(prefix, `${key}[${v}]`, value[v]);
                });
            }
            else {
                s.push(`${encodeURIComponent(prefix + key)}=${encodeURIComponent(value)}`);
            }
        }
        keys.forEach((key) => {
            add('', key, data[key]);
        });
        // Return the resulting serialization
        return s.join('&').replace(/%20/g, '+');
    }
}
Ajax.GLOBAL_EVENT_AJAX_PRE_SEND = 'ajaxPreSend';
Ajax.GLOBAL_EVENT_AJAX_POST_SEND = 'ajaxPostSend';
/**
 * Maximum number of characters of a valid URL
 */
Ajax.MAX_URL_LENGTH = 4096;
//# sourceMappingURL=ajax.js.map