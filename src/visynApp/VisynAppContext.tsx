import * as React from 'react';
import type { ITDPClientConfig } from '../base/clientConfig';
import type { IUser } from '../security';

export const VisynAppContext = React.createContext<{
  user: IUser | null;
  appName: JSX.Element | string;
  clientConfig: ITDPClientConfig;
}>(null);

export function useVisynAppContext() {
  const context = React.useContext(VisynAppContext);
  if (!context) {
    throw Error('VisynApp can only be used as child of VisynAppProvider.');
  }
  return context;
}
