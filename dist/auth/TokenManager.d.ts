import { IEvent, EventHandler } from '../base/event';
import { IAuthorizationConfiguration, IAuthorizationFlow, IRenderAuthorizationOptions } from './interfaces';
type ExtractParametersExceptEvent<F extends Function> = F extends (event: IEvent, ...args: infer A) => any ? A : never;
export declare function authorizationStored(event: IEvent, id: string, token: string): void;
export declare function authorizationRemoved(event: IEvent, ids: string[]): void;
export declare class TokenManager extends EventHandler {
    static EVENT_AUTHORIZATION_STORED: string;
    static EVENT_AUTHORIZATION_REMOVED: string;
    /**
     * Map of saved tokens.
     */
    protected tokens: Map<string, string>;
    /**
     * Map of authorization configurations.
     */
    protected authorizationConfigurations: Map<string, import("./interfaces").ISimplePopupAuthorizationConfiguration>;
    /**
     * Map of possible authorization flows.
     */
    protected authorizationFlows: Map<string, IAuthorizationFlow<import("./interfaces").ISimplePopupAuthorizationConfiguration>>;
    constructor();
    on(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, handler?: typeof authorizationStored): this;
    on(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, handler?: typeof authorizationRemoved): this;
    off(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, handler?: typeof authorizationStored): this;
    off(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, handler?: typeof authorizationRemoved): this;
    fire(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, ...params: ExtractParametersExceptEvent<typeof authorizationStored>): this;
    fire(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, ...params: ExtractParametersExceptEvent<typeof authorizationRemoved>): this;
    /**
     * Adds authorization configurations to the token manager.
     * @param authorizationConfiguration Authorization configurations to be added.
     */
    addAuthorizationConfiguration(authorizationConfiguration?: IAuthorizationConfiguration | IAuthorizationConfiguration[]): Promise<void>;
    /**
     * Adds authorization flows to the token manager.
     * @param authorizationFlows Authorization flows to be added.
     */
    addAuthorizationFlow(authorizationFlows: {
        [id: string]: IAuthorizationFlow;
    }): Promise<void>;
    /**
     * Retrieves the token of a specific authorization.
     * @param id ID of the token.
     * @returns The retrieved token, or null if no token is available.
     */
    getToken(id: string): string | null;
    /**
     * Retrieves the token of a specific authorization asynchronously.
     * @param id ID of the token.
     * @param options Options for the token get.
     * @returns The retrieved token, or null if no token is available.
     */
    getTokenAsync(id: string, options?: {
        /**
         * If true, the promise is resolved as soon as the token is stored, i.e. it waits for the token.
         * Note that it will wait forever until a `EVENT_AUTHORIZATION_STORED` is triggered.
         */
        wait?: boolean;
    }): Promise<string | null>;
    /**
     * Removes a token for a specific authorization.
     * @param id ID of the authorization.
     */
    invalidateToken(ids: string | string[]): Promise<void>;
    /**
     * Sets an authorization token.
     * @param id ID of the authorization.
     * @param token Token to be set.
     * @returns True if the token was set, false otherwise.
     */
    setToken(id: string, token: string): boolean;
    /**
     * Returns all stored authorization tokens.
     * @param authConfigurations Optional ID(s) or Authorization configuration(s) filter.
     * @returns Object of id -> token.
     */
    /**
     * Runs a single or multiple authorization configurations. See `runAuthorization` for details.
     * @param authConfigurations ID(s) or Authorization configuration(s) to be run.
     * @param options Options for the authorization runs.
     */
    runAuthorizations(authConfigurations: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null, options: {
        /**
         * Render function called every time the authorization status is updated.
         */
        render: (options: IRenderAuthorizationOptions) => void;
        /**
         * True if the authorization should be run even if a token already exists (i.e. to override it).
         */
        force?: boolean;
    }): Promise<void>;
    /**
     * Runs a specific authorization configuration and sets the result token in the manager.
     * @param authConfiguration ID or Authorization configuration to be run.
     * @param options Options for the authorization run.
     * @returns The retrieved token, or null if no token is available.
     */
    protected runAuthorization(authConfiguration: string | IAuthorizationConfiguration, options: Parameters<TokenManager['runAuthorizations']>[1]): Promise<string | null>;
}
/**
 * Error thrown when a token is invalid (i.e. expired).
 */
export declare class InvalidTokenError extends Error {
    readonly ids: string[];
    constructor(ids: string | string[]);
}
/**
 * Global token manager for TDP applications.
 */
export declare const TDPTokenManager: TokenManager;
export {};
//# sourceMappingURL=TokenManager.d.ts.map