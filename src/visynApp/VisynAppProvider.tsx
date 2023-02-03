import { merge } from 'lodash';
import * as React from 'react';
import { ITDPClientConfig, loadClientConfig } from '../base/clientConfig';
import { useAsync } from '../hooks';
import { useInitVisynApp, useVisynUser } from './hooks';
import { VisynAppContext } from './VisynAppContext';

export function VisynAppProvider({
  children,
  appName,
  defaultClientConfig,
}: {
  children?: React.ReactNode;
  appName: JSX.Element | string;
  /**
   * Client configuration which is automatically populated by the '/clientConfig.json' on initialize.
   * To enable the asynchronous loading of the client configuration, pass an object (optionally with default values).
   * Passing falsy values disables the client configuration load.
   */
  defaultClientConfig?: ITDPClientConfig | null | undefined;
}) {
  const user = useVisynUser();
  const { status: initStatus } = useInitVisynApp();

  const parseClientConfig = React.useCallback(async (): Promise<ITDPClientConfig> => {
    if (!defaultClientConfig) {
      return {};
    }
    const remoteClientConfig = await loadClientConfig();
    return merge(defaultClientConfig || {}, remoteClientConfig || {});
  }, [defaultClientConfig]);

  const { value: clientConfig, status: clientConfigStatus } = useAsync(parseClientConfig, []);

  const context = React.useMemo(
    () => ({
      user,
      appName,
      clientConfig,
    }),
    [user, appName, clientConfig],
  );

  return <VisynAppContext.Provider value={context}>{initStatus === 'success' && clientConfigStatus === 'success' ? children : null}</VisynAppContext.Provider>;
}
