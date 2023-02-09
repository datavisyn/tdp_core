import type { IAuthorizationConfiguration } from '../auth/interfaces';
import { Ajax } from './ajax';

export interface ITDPClientConfig {
  /**
   * Configuration for the TDPTokenManager.
   */
  tokenManager?: {
    /**
     * Initial authorization configurations.
     * Note that this is an object, because then the deep-merge with the local and remote config is easier.
     */
    authorizationConfigurations?: {
      [id: string]: Omit<IAuthorizationConfiguration, 'id'>;
    };
  };
  [key: string]: any;
}

/**
 * Loads the client config from '/clientConfig.json' and parses it.
 */
export async function loadClientConfig<T = any>(): Promise<T | null> {
  return Ajax.getJSON('/clientConfig.json').catch((e) => {
    console.error('Error parsing clientConfig.json', e);
    return null;
  });
}
