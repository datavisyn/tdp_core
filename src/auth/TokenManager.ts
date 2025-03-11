import castArray from 'lodash/castArray';
import { EventHandler, GlobalEventHandler, IEvent, IEventListener } from 'visyn_core/base';
import { UserSession } from 'visyn_core/security';

import { ERenderAuthorizationStatus, IAuthorizationConfiguration, IAuthorizationFlow, IRenderAuthorizationOptions } from './interfaces';
import { simplePopupFlow } from './simplePopup';

// Extract all parameters except the first one
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type ExtractParametersExceptEvent<F extends Function> = F extends (event: IEvent, ...args: infer A) => any ? A : never;

export declare function authorizationStored(event: IEvent, id: string, token: string): void;
export declare function authorizationRemoved(event: IEvent, ids: string[]): void;

export class TokenManager extends EventHandler {
  static EVENT_AUTHORIZATION_STORED = 'event_authorization_stored';

  static EVENT_AUTHORIZATION_REMOVED = 'event_authorization_removed';

  /**
   * Map of saved tokens.
   */
  protected tokens = new Map<string, string>();

  /**
   * Map of authorization configurations.
   */
  protected authorizationConfigurations = new Map<string, IAuthorizationConfiguration>();

  /**
   * Map of possible authorization flows.
   */
  protected authorizationFlows = new Map<string, IAuthorizationFlow>();

  constructor() {
    super();

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

  on(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, handler?: typeof authorizationStored): this;
  on(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, handler?: typeof authorizationRemoved): this;
  on(events: string | { [key: string]: IEventListener }, handler?: IEventListener): this {
    return super.on(events, handler);
  }

  off(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, handler?: typeof authorizationStored): this;
  off(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, handler?: typeof authorizationRemoved): this;
  off(events: string | { [key: string]: IEventListener }, handler?: IEventListener): this {
    return super.off(events, handler);
  }

  fire(events: typeof TokenManager.EVENT_AUTHORIZATION_STORED, ...params: ExtractParametersExceptEvent<typeof authorizationStored>): this;
  fire(events: typeof TokenManager.EVENT_AUTHORIZATION_REMOVED, ...params: ExtractParametersExceptEvent<typeof authorizationRemoved>): this;
  fire(events: string, ...args: any[]): this {
    return super.fire(events, ...args);
  }

  /**
   * Adds authorization configurations to the token manager.
   * @param authorizationConfiguration Authorization configurations to be added.
   */
  public async addAuthorizationConfiguration(authorizationConfiguration: IAuthorizationConfiguration | IAuthorizationConfiguration[] = []): Promise<void> {
    // Fill the authorization configurations with the predefined configurations.
    castArray(authorizationConfiguration).forEach((config) => this.authorizationConfigurations.set(config.id, config));
  }

  /**
   * Adds authorization flows to the token manager.
   * @param authorizationFlows Authorization flows to be added.
   */
  public async addAuthorizationFlow(authorizationFlows: { [id: string]: IAuthorizationFlow }): Promise<void> {
    // Fill the authorization flows with the predefined configurations.
    Object.entries(authorizationFlows).forEach(([id, flow]) => this.authorizationFlows.set(id, flow));
  }

  /**
   * Retrieves the token of a specific authorization.
   * @param id ID of the token.
   * @returns The retrieved token, or null if no token is available.
   */
  public getToken(id: string): string | null {
    return this.tokens.get(id);
  }

  /**
   * Retrieves the token of a specific authorization asynchronously.
   * @param id ID of the token.
   * @param options Options for the token get.
   * @returns The retrieved token, or null if no token is available.
   */
  public async getTokenAsync(
    id: string,
    options?: {
      /**
       * If true, the promise is resolved as soon as the token is stored, i.e. it waits for the token.
       * Note that it will wait forever until a `EVENT_AUTHORIZATION_STORED` is triggered.
       */
      wait?: boolean;
    },
  ): Promise<string | null> {
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
  public async invalidateToken(ids: string | string[]): Promise<void> {
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
  public setToken(id: string, token: string): boolean {
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
  public async runAuthorizations(
    authConfigurations: string | string[] | IAuthorizationConfiguration | IAuthorizationConfiguration[] | null,
    options: {
      /**
       * Render function called every time the authorization status is updated.
       */
      render: (options: IRenderAuthorizationOptions) => void;
      /**
       * True if the authorization should be run even if a token already exists (i.e. to override it).
       */
      force?: boolean;
    },
  ): Promise<void> {
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
  protected async runAuthorization(
    authConfiguration: string | IAuthorizationConfiguration,
    options: Parameters<TokenManager['runAuthorizations']>[1],
  ): Promise<string | null> {
    let config: IAuthorizationConfiguration = null;
    if (typeof authConfiguration === 'string') {
      config = this.authorizationConfigurations.get(authConfiguration);
      if (!config) {
        throw Error(`No authorization configuration with id ${authConfiguration} exists.`);
      }
    } else {
      config = authConfiguration;
    }

    const existingToken = this.tokens.get(config.id);
    if (!options.force && existingToken) {
      return undefined;
    }

    const render = (override: Pick<IRenderAuthorizationOptions, 'status' | 'error'>) => {
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
          } catch (error) {
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

/**
 * Error thrown when a token is invalid (i.e. expired).
 */
export class InvalidTokenError extends Error {
  public readonly ids: string[] = null;

  constructor(ids: string | string[]) {
    super(`Token is invalid for ${castArray(ids).join(', ')}`);

    this.ids = castArray(ids);
  }
}

/**
 * Global token manager for TDP applications.
 */
export const TDPTokenManager = new TokenManager();
