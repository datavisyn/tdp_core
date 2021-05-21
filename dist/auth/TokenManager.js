import { EventHandler, GlobalEventHandler, UserSession } from 'phovea_core';
import { openTokenWindow } from './TokenWindowFlow';
export var ERenderAuthorizationStatus;
(function (ERenderAuthorizationStatus) {
    ERenderAuthorizationStatus["NOT_TRIGGERED"] = "not_triggered";
    ERenderAuthorizationStatus["PENDING"] = "pending";
    ERenderAuthorizationStatus["SUCCESS"] = "success";
    ERenderAuthorizationStatus["ERROR"] = "error";
})(ERenderAuthorizationStatus || (ERenderAuthorizationStatus = {}));
export class TokenManager extends EventHandler {
    constructor() {
        super();
        this.tokens = new Map();
        // Clear all tokens as soon as a user logs out.
        GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, () => {
            if (this.tokens.size > 0) {
                const removedIds = Array.from(this.tokens.keys());
                this.tokens.clear();
                this.fire(TokenManager.EVENT_AUTHORIZATION_REMOVED, removedIds);
            }
        });
    }
    on(events, handler) {
        return super.on(events, handler);
    }
    off(events, handler) {
        return super.off(events, handler);
    }
    fire(events, ...args) {
        return super.fire(events, ...args);
    }
    /**
     * Retrieves the token of a specific authorization.
     * @param id ID of the token.
     * @param options Options for the token get.
     * @returns The retrieved token, or null if no token is available.
     */
    async getAuthorization(id, options) {
        const token = this.tokens.get(id);
        if (!token && (options === null || options === void 0 ? void 0 : options.wait)) {
            return new Promise((resolve) => {
                this.on(TokenManager.EVENT_AUTHORIZATION_STORED, (_, storedId, storedToken) => {
                    if (id === storedId) {
                        resolve(storedToken);
                    }
                });
            });
        }
        return token;
    }
    /**
     * Removes a token for a specific authorization.
     * @param id ID of the authorization.
     * @returns True if the token was found and removed, false otherwise.
     */
    async invalidateAuthorization(id) {
        const removed = this.tokens.delete(id);
        this.fire(TokenManager.EVENT_AUTHORIZATION_REMOVED, [id]);
        return removed;
    }
    /**
     * Sets an authorization token.
     * @param id ID of the authorization.
     * @param token Token to be set.
     * @returns True if the token was set, false otherwise.
     */
    setAuthorization(id, token) {
        if (token) {
            this.tokens.set(id, token);
            this.fire(TokenManager.EVENT_AUTHORIZATION_STORED, id, token);
            return true;
        }
        return false;
    }
    /**
     * Returns all stored authorization tokens.
     * @returns Object of id -> token.
     */
    getAuthorizations() {
        return Array.from(this.tokens.entries()).reduce((acc, [id, token]) => ({ ...acc, [id]: token }), {});
    }
    /**
     * Runs a single or multiple authorization configurations. See `runAuthorization` for details.
     * @param authConfigurations Authorization configurations to be run.
     * @param options Options for the authorization runs.
     */
    async runAuthorizations(authConfigurations, options) {
        if (authConfigurations) {
            // Iterate over all authorization configurations
            for (const authConfiguration of Array.isArray(authConfigurations) ? authConfigurations : [authConfigurations]) {
                await this.runAuthorization(authConfiguration, options);
            }
        }
    }
    /**
     * Runs a specific authorization configuration and sets the result token in the manager.
     * @param authConfiguration Authorization configuration to be run.
     * @param options Options for the authorization run.
     * @returns The retrieved token, or null if no token is available.
     */
    async runAuthorization(authConfiguration, options) {
        const existingToken = this.tokens.get(authConfiguration.id);
        if (!options.force && existingToken) {
            return;
        }
        const render = (override) => {
            options.render({
                ...override,
                authConfiguration,
                trigger: async () => {
                    try {
                        render({
                            status: ERenderAuthorizationStatus.PENDING,
                        });
                        const token = await openTokenWindow(authConfiguration);
                        this.setAuthorization(authConfiguration.id, token);
                    }
                    catch (error) {
                        render({
                            status: ERenderAuthorizationStatus.ERROR,
                            error,
                        });
                    }
                },
            });
        };
        render({
            status: authConfiguration.type === 'simplePopup' ? ERenderAuthorizationStatus.NOT_TRIGGERED : ERenderAuthorizationStatus.PENDING,
        });
        const token = await this.getAuthorization(authConfiguration.id, { wait: true });
        render({
            status: ERenderAuthorizationStatus.SUCCESS,
        });
        return token;
    }
}
TokenManager.EVENT_AUTHORIZATION_STORED = 'event_authorization_stored';
TokenManager.EVENT_AUTHORIZATION_REMOVED = 'event_authorization_removed';
export const tokenManager = new TokenManager();
//# sourceMappingURL=TokenManager.js.map