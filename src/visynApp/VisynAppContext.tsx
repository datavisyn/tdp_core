import * as React from 'react';
import { IUser } from '../security';
import { useVisynUser } from './hooks';

export const VisynAppContext = React.createContext<{
  user: IUser | null;
  appName: JSX.Element | string;
}>(null);

export function VisynAppProvider({ children, appName }: { children?: React.ReactNode; appName: JSX.Element | string }) {
  const user = useVisynUser();

  const context = React.useMemo(
    () => ({
      user,
      appName,
    }),
    [user, appName],
  );

  return <VisynAppContext.Provider value={context}>{children}</VisynAppContext.Provider>;
}
