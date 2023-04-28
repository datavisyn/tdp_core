import { castArray } from 'lodash';
import { EventHandler, GlobalEventHandler } from 'visyn_core';
import { UserSession } from 'visyn_core';
import { ERenderAuthorizationStatus } from './interfaces';
import { simplePopupFlow } from './simplePopup';
class TokenManager extends EventHandler {
    constructor() {
        super();
        /**
         * Map of saved tokens.
         */
        this.tokens = new Map();
        /**
         * Map of authorization configurations.
         */
        this.authorizationConfigurations = new Map();
        /**
         * Map of possible authorization flows.
         */
        this.authorizationFlows = new Map();
        // TODO: Currently, only one authorization flow is possible. Maybe add an extension point in the future.
        this.addAuthorizationFlow({
            simplePopup: simplePopupFlow,
        });
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
     * Adds authorization configurations to the token manager.
     * @param authorizationConfiguration Authorization configurations to be added.
     */
    async addAuthorizationConfiguration(authorizationConfiguration = []) {
        // Fill the authorization configurations with the predefined configurations.
        castArray(authorizationConfiguration).forEach((config) => this.authorizationConfigurations.set(config.id, config));
    }
    /**
     * Adds authorization flows to the token manager.
     * @param authorizationFlows Authorization flows to be added.
     */
    async addAuthorizationFlow(authorizationFlows) {
        // Fill the authorization flows with the predefined configurations.
        Object.entries(authorizationFlows).forEach(([id, flow]) => this.authorizationFlows.set(id, flow));
    }
    /**
     * Retrieves the token of a specific authorization.
     * @param id ID of the token.
     * @returns The retrieved token, or null if no token is available.
     */
    getToken(id) {
        return this.tokens.get(id);
    }
    /**
     * Retrieves the token of a specific authorization asynchronously.
     * @param id ID of the token.
     * @param options Options for the token get.
     * @returns The retrieved token, or null if no token is available.
     */
    async getTokenAsync(id, options) {
        const token = this.tokens.get(id);
        if (!token && options?.wait) {
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
     */
    async invalidateToken(ids) {
        ids = castArray(ids);
        ids.forEach((id) => this.tokens.delete(id));
        this.fire(TokenManager.EVENT_AUTHORIZATION_REMOVED, ids);
    }
    /**
     * Sets an authorization token.
     * @param id ID of the authorization.
     * @param token Token to be set.
     * @returns True if the token was set, false otherwise.
     */
    setToken(id, token) {
        if (token) {
            this.tokens.set(id, token);
            this.fire(TokenManager.EVENT_AUTHORIZATION_STORED, id, token);
            return true;
        }
        return false;
    }
    /**
     * Returns all stored authorization tokens.
     * @param authConfigurations Optional ID(s) or Authorization configuration(s) filter.
     * @returns Object of id -> token.
     */
    // public getTokens(authConfigurations: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null): { [id: string]: string | null } {
    //   const keys = authConfigurations ? castArray(authConfigurations).map((auth) => typeof(auth) === 'string' ? auth : auth.id) : Array.from(this.tokens.keys());
    //   return keys.reduce((acc, id) => ({ ...acc, [id]: this.tokens.get(id) }), {});
    // }
    /**
     * Runs a single or multiple authorization configurations. See `runAuthorization` for details.
     * @param authConfigurations ID(s) or Authorization configuration(s) to be run.
     * @param options Options for the authorization runs.
     */
    async runAuthorizations(authConfigurations, options) {
        if (authConfigurations) {
            // Iterate over all authorization configurations
            for (const authConfiguration of castArray(authConfigurations)) {
                // eslint-disable-next-line no-await-in-loop
                await this.runAuthorization(authConfiguration, options);
            }
        }
    }
    /**
     * Runs a specific authorization configuration and sets the result token in the manager.
     * @param authConfiguration ID or Authorization configuration to be run.
     * @param options Options for the authorization run.
     * @returns The retrieved token, or null if no token is available.
     */
    async runAuthorization(authConfiguration, options) {
        let config = null;
        if (typeof authConfiguration === 'string') {
            config = this.authorizationConfigurations.get(authConfiguration);
            if (!config) {
                throw Error(`No authorization configuration with id ${authConfiguration} exists.`);
            }
        }
        else {
            config = authConfiguration;
        }
        const existingToken = this.tokens.get(config.id);
        if (!options.force && existingToken) {
            return undefined;
        }
        const render = (override) => {
            options.render({
                ...override,
                authConfiguration: config,
                trigger: async () => {
                    try {
                        render({
                            status: ERenderAuthorizationStatus.PENDING,
                        });
                        const authorizationFlow = this.authorizationFlows.get(config.type);
                        if (!authorizationFlow) {
                            throw Error(`No authorization flow of type ${config.type} found.`);
                        }
                        const token = await authorizationFlow(config);
                        this.setToken(config.id, token);
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
        // TODO: Should we support automatically triggering auth flows?
        render({
            status: ERenderAuthorizationStatus.NOT_TRIGGERED,
        });
        const token = await this.getTokenAsync(config.id, { wait: true });
        render({
            status: ERenderAuthorizationStatus.SUCCESS,
        });
        return token;
    }
}
TokenManager.EVENT_AUTHORIZATION_STORED = 'event_authorization_stored';
TokenManager.EVENT_AUTHORIZATION_REMOVED = 'event_authorization_removed';
export { TokenManager };
/**
 * Error thrown when a token is invalid (i.e. expired).
 */
export class InvalidTokenError extends Error {
    constructor(ids) {
        super(`Token is invalid for ${castArray(ids).join(', ')}`);
        this.ids = null;
        this.ids = castArray(ids);
    }
}
/**
 * Global token manager for TDP applications.
 */
export const TDPTokenManager = new TokenManager();
//# sourceMappingURL=TokenManager.js.map