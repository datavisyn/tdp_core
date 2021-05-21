import { EventHandler, GlobalEventHandler, IEvent, IEventListener, UserSession } from 'phovea_core';
import { IAuthorizationType } from './interfaces';
import { openTokenWindow } from './TokenWindowFlow';

// Extract all parameters except the first one
type ExtractParametersExceptEvent<F extends Function> = F extends (event: IEvent, ...args: infer A) => any ? A : never;

export declare function authorizationStored(event: IEvent, id: string, token: string): void;
export declare function authorizationRemoved(event: IEvent, ids: string[]): void;

export enum ERenderAuthorizationStatus {
  NOT_TRIGGERED = 'not_triggered',
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
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

export class TokenManager extends EventHandler {
  static EVENT_AUTHORIZATION_STORED = 'event_authorization_stored';
  static EVENT_AUTHORIZATION_REMOVED = 'event_authorization_removed';

  protected tokens: Map<string, string> = new Map<string, string>();

  constructor() {
    super();
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
   * Retrieves the token of a specific authorization.
   * @param id ID of the token.
   * @param options Options for the token get.
   * @returns The retrieved token, or null if no token is available.
   */
  public async getAuthorization(
    id: string,
    options?: {
      /**
       * If true, the promise is resolved as soon as the token is stored, i.e. it waits for the token.
       * Note that it will wait forever until a `EVENT_AUTHORIZATION_STORED` is triggered.
       */
      wait?: boolean;
    }
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
   * @returns True if the token was found and removed, false otherwise.
   */
  public async invalidateAuthorization(id: string): Promise<boolean> {
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
  public setAuthorization(id: string, token: string): boolean {
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
  public getAuthorizations(): { [id: string]: string } {
    return Array.from(this.tokens.entries()).reduce((acc, [id, token]) => ({ ...acc, [id]: token }), {});
  }

  /**
   * Runs a single or multiple authorization configurations. See `runAuthorization` for details.
   * @param authConfigurations Authorization configurations to be run.
   * @param options Options for the authorization runs.
   */
  public async runAuthorizations(
    authConfigurations: IAuthorizationType | IAuthorizationType[] | null,
    options: {
      /**
       * Render function called every time the authorization status is updated.
       */
      render: (options: IRenderAuthorizationOptions) => void;
      /**
       * True if the authorization should be run even if a token already exists (i.e. to override it).
       */
      force?: boolean;
    }
  ): Promise<void> {
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
  public async runAuthorization(authConfiguration: IAuthorizationType, options: Parameters<TokenManager['runAuthorizations']>[1]): Promise<string | null> {
    const existingToken = this.tokens.get(authConfiguration.id);
    if (!options.force && existingToken) {
      return;
    }

    const render = (override: Pick<IRenderAuthorizationOptions, 'status' | 'error'>) => {
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
          } catch (error) {
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

export const tokenManager = new TokenManager();
