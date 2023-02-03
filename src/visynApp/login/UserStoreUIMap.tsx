import React from 'react';
import { Text } from '@mantine/core';
import { LoginUtils } from '../../base/LoginUtils';
import { VisynLoginForm } from './VisynLoginForm';
import { IUserStore } from '../../security';
import { I18nextManager } from '../../i18n';

interface IUserStoreRenderProps<T extends IUserStore = IUserStore> {
  setError(error: string | null): void;
  hasError: boolean;
  store: T;
}

export const UserStoreUIMap: Map<string, (props: IUserStoreRenderProps) => React.ReactElement> = new Map();

export function DefaultLoginForm({ setError, hasError, store }: IUserStoreRenderProps) {
  return (
    <VisynLoginForm
      hasError={hasError}
      onLogin={async (username: string, password: string) => {
        setError(null);
        return LoginUtils.login(username, password).catch((e) => {
          if (e.response && e.response.status !== 401) {
            // 401 = Unauthorized
            // server error
            setError('not_reachable');
          } else {
            setError(e);
          }
        });
      }}
    />
  );
}

UserStoreUIMap.set('DefaultLoginForm', DefaultLoginForm);

UserStoreUIMap.set('AutoLoginForm', ({ setError, store }: IUserStoreRenderProps) => (
  <Text align="justify">{I18nextManager.getInstance().i18n.t('tdp:core.visynApp.securityStores.ALBSecurityStore.message')}</Text>
));
