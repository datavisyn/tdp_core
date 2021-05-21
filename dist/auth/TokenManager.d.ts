import { EventHandler, IEvent } from 'phovea_core';
import { IAuthorizationType } from './interfaces';
declare type ExtractParametersExceptEvent<F extends Function> = F extends (event: IEvent, ...args: infer A) => any ? A : never;
export declare function authorizationStored(event: IEvent, id: string, token: string): void;
export declare function authorizationRemoved(event: IEvent, ids: string[]): void;
export declare enum ERenderAuthorizationStatus {
    NOT_TRIGGERED = "not_triggered",
    PENDING = "pending",
    SUCCESS = "success",
    ERROR = "error"
}
interface IRenderAuthorizationOptions {
    /**
     * Currently active authorization configuration.
     */
    authConfiguration: IAuthorizationType;
    /**
     * Current status of the authorization process.
     */
    status: ERenderAuthorizationStatus;
    /**
     * If `status` is `not_triggered`, the trigger function is passed here.
     * Some authorization configurations require the active triggering of the process, i.e. when opening a popup.
     * Render a button and trigger this function to continue the authorization process.
     */
    trigger?: () => void;
    /**
     * If `status` is `error`, the error is passed here.
     */
    error?: Error;
}
export declare class TokenManager extends EventHandler {
    static EVENT_AUTHORIZATION_STORED: string;
    static EVENT_AUTHORIZATION_REMOVED: string;
    protected tokens: Map<string, string>;
    constructor();
    on(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, handler?: typeof authorizationStored): this;
    on(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, handler?: typeof authorizationRemoved): this;
    off(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, handler?: typeof authorizationStored): this;
    off(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, handler?: typeof authorizationRemoved): this;
    fire(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, ...params: ExtractParametersExceptEvent<typeof authorizationStored>): this;
    fire(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, ...params: ExtractParametersExceptEvent<typeof authorizationRemoved>): this;
    /**
     * Retrieves the token of a specific authorization.
     * @param id ID of the token.
     * @param options Options for the token get.
     * @returns The retrieved token, or null if no token is available.
     */
    getAuthorization(id: string, options?: {
        /**
         * If true, the promise is resolved as soon as the token is stored, i.e. it waits for the token.
         * Note that it will wait forever until a `EVENT_AUTHORIZATION_STORED` is triggered.
         */
        wait?: boolean;
    }): Promise<string | null>;
    /**
     * Removes a token for a specific authorization.
     * @param id ID of the authorization.
     * @returns True if the token was found and removed, false otherwise.
     */
    invalidateAuthorization(id: string): Promise<boolean>;
    /**
     * Sets an authorization token.
     * @param id ID of the authorization.
     * @param token Token to be set.
     * @returns True if the token was set, false otherwise.
     */
    setAuthorization(id: string, token: string): boolean;
    /**
     * Returns all stored authorization tokens.
     * @returns Object of id -> token.
     */
    getAuthorizations(): {
        [id: string]: string;
    };
    /**
     * Runs a single or multiple authorization configurations. See `runAuthorization` for details.
     * @param authConfigurations Authorization configurations to be run.
     * @param options Options for the authorization runs.
     */
    runAuthorizations(authConfigurations: IAuthorizationType | IAuthorizationType[] | null, options: {
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
     * @param authConfiguration Authorization configuration to be run.
     * @param options Options for the authorization run.
     * @returns The retrieved token, or null if no token is available.
     */
    runAuthorization(authConfiguration: IAuthorizationType, options: Parameters<TokenManager['runAuthorizations']>[1]): Promise<string | null>;
}
export declare const tokenManager: TokenManager;
export {};
