import { PropertyHandler } from '../base/url/PropertyHandler';
import { HashPropertyHandler } from '../base/url';
type OfflineGenerator = ((data: any, url: string) => Promise<any>) | Promise<any> | any;
export declare class AppContext {
    /**
     * whether the standard api calls should be prevented
     * @type {boolean}
     */
    offline: boolean;
    static context: string;
    /**
     * version of the core
     */
    static version: string;
    /**
     * server prefix of api calls
     * @type {string}
     */
    server_url: string;
    /**
     * server suffix for api calls
     * @type {string}
     */
    server_json_suffix: string;
    /**
     * initializes certain properties of the core
     * @param config
     */
    init(config?: {
        offline?: boolean;
        server_url?: string;
        server_json_suffix?: string;
    }): void;
    isOffline(): boolean;
    /**
     * initializes itself based on script data attributes
     * @private
     */
    protected _init(): void;
    private removeNodeObserver;
    /**
     * utility function to get notified, when the given dom element is removed from its parent
     * @param node
     * @param callback
     */
    onDOMNodeRemoved(node: Element | Element[], callback: () => void, thisArg?: any): void;
    /**
     * access to hash parameters and set them, too
     * @type {HashProperties}
     */
    hash: HashPropertyHandler;
    /**
     * access to get parameters
     * @type {PropertyHandler}
     */
    param: PropertyHandler;
    /**
     * converts the given api url to an absolute with optional get parameters
     * @param url
     * @param data
     * @returns {string}
     */
    api2absURL(url: string, data?: any): string;
    private defaultGenerator;
    setDefaultOfflineGenerator(generator: OfflineGenerator | null): void;
    /**
     * handler in case phovea is set to be in offline mode
     * @param generator
     * @param data
     * @param url
     * @returns {Promise<OfflineGenerator>}
     */
    private sendOffline;
    /**
     * api version of send
     * @param url api relative url
     * @param data arguments
     * @param method http method
     * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
     * @param offlineGenerator in case phovea is set to be offline
     * @returns {Promise<any>}
     */
    sendAPI(url: string, data?: any, method?: string, expectedDataType?: string, offlineGenerator?: OfflineGenerator): Promise<any>;
    /**
     * api version of getJSON
     * @param url api relative url
     * @param data arguments
     * @param offlineGenerator in case of offline flag is set what should be returned
     * @returns {Promise<any>}
     */
    getAPIJSON(url: string, data?: any, offlineGenerator?: OfflineGenerator): Promise<any>;
    /**
     * api version of getData
     * @param url api relative url
     * @param data arguments
     * @param expectedDataType expected data type to return, in case of JSON it will be parsed using JSON.parse
     * @param offlineGenerator in case of offline flag is set what should be returned
     * @returns {Promise<any>}
     */
    getAPIData(url: string, data?: any, expectedDataType?: string, offlineGenerator?: OfflineGenerator): Promise<any>;
    private static instance;
    static getInstance(): AppContext;
}
export {};
//# sourceMappingURL=AppContext.d.ts.map