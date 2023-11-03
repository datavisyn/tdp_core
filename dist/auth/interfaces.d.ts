/**
 * Base type for authorization flows.
 */
export type IAuthorizationFlow<T extends IBaseAuthorizationConfiguration = IAuthorizationConfiguration> = (type: T) => Promise<string>;
/**
 * Base interface for authorization configurations.
 */
export interface IBaseAuthorizationConfiguration {
    /**
     * Unique id of the authorization configuration.
     */
    id: string;
    /**
     * Visible name of the authorization configuration.
     */
    name: string;
}
/**
 * Interface for the simple popup authorization flow.
 */
export interface ISimplePopupAuthorizationConfiguration extends IBaseAuthorizationConfiguration {
    /**
     * Type of the authorization flow.
     */
    type: 'simplePopup';
    /**
     * URL of the opened window. This is often in the format `https://www.domain.com/login?rd=https://www.application.com/`.
     */
    url: string;
    /**
     * Name of parameter in the redirect url where the token is stored. This is often `access_token`.
     */
    tokenParameter: string;
}
/**
 * Possible authorization flows.
 */
export type IAuthorizationConfiguration = ISimplePopupAuthorizationConfiguration;
export declare enum ERenderAuthorizationStatus {
    NOT_TRIGGERED = "not_triggered",
    PENDING = "pending",
    SUCCESS = "success",
    ERROR = "error"
}
export interface IRenderAuthorizationOptions {
    /**
     * Currently active authorization configuration.
     */
    authConfiguration: IAuthorizationConfiguration;
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
//# sourceMappingURL=interfaces.d.ts.map