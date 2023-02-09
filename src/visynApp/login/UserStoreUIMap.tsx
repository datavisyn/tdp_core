import React from 'react';
import { Anchor, Text } from '@mantine/core';
import { LoginUtils } from '../../base/LoginUtils';
import { VisynLoginForm } from './VisynLoginForm';
import { IUserStore } from '../../security';
import { I18nextManager } from '../../i18n';
import { UserSession } from '../../app/UserSession';

interface IUserStoreRenderProps<T extends IUserStore = IUserStore> {
  setError(error: string | null): void;
  store: T;
}

export const UserStoreUIMap: Map<string, (props: IUserStoreRenderProps) => React.ReactElement> = new Map();

export function DefaultLoginForm({ setError, store }: IUserStoreRenderProps) {
  return (
    <VisynLoginForm
      onLogin={async (username: string, password: string) => {
        setError(null);
        return LoginUtils.login(username, password)
          .then(() => {
            setError(null);
          })
          .catch((e) => {
            if (e.response && e.response.status !== 401) {
              // 401 = Unauthorized
              // server error
              setError('not_reachable');
            } else {
              setError(I18nextManager.getInstance().i18n.t('phovea:security_flask.alertWrongCredentials'));
            }
          });
      }}
    />
  );
}

UserStoreUIMap.set('DefaultLoginForm', DefaultLoginForm);

export function AutoLoginForm({ setError, store }: IUserStoreRenderProps) {
  const [loginInProgress, setLoginInProgress] = React.useState<boolean>(false);
  const POLL_INTERVAL = 500;
  const MAX_POLL_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
  const HOSTNAME = window.location.hostname;

  const pollQueryStringChange = async (popup: Window): Promise<void> => {
    // Keep track of polling iterations to avoid endless loops.
    let tries = 0;
    const maxTries = MAX_POLL_TIME / POLL_INTERVAL;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (popup.closed) {
        setError('Popup was closed before a successful login.');
      }
      try {
        if (popup.window.location.hostname === HOSTNAME) {
          // eslint-disable-next-line no-await-in-loop
          const user = await LoginUtils.loggedInAs().catch(() => {
            // ignore not yet logged in
          });
          if (user) {
            UserSession.getInstance().login(user);
          } else {
            setError('Could not login in, try refreshing the page.');
          }
          break;
        }
      } catch (e) {
        console.error(`Checking window for token failed: `, e);
      }
      // User is not logged in yet, waiting for POLL_INTERVAL
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, POLL_INTERVAL);
      });
      tries++;
      if (tries > maxTries) {
        setError(`Login timed out after ${MAX_POLL_TIME} milliseconds.`);
      }
    }
  };

  const login = async () => {
    if (!loginInProgress) {
      // Only allow a single concurrent login access
      setLoginInProgress(true);

      let popup: Window = null;
      try {
        console.log(window.location);
        const authUrl = window.location.origin;
        popup = window.open(
          authUrl,
          'Authorization',
          'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,width=600,height=600',
        );
        if (!popup) {
          setError('Could not open login popup.');
          return null;
        }
        // Polling until we are actually logged in
        await pollQueryStringChange(popup);
      } catch (e) {
        console.error('An error occurred while communicating with the OAuth provider', e);
        return null;
      } finally {
        setLoginInProgress(false);
        popup?.close();
      }
    }
    return undefined;
  };

  return (
    <Text align="justify">
      You will be automatically logged in as soon as you visit the application. If your access is expired, click{' '}
      <Anchor
        href="#"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          login();
        }}
      >
        here
      </Anchor>{' '}
      to open a login window or refresh the page.
    </Text>
  );
}

UserStoreUIMap.set('AutoLoginForm', AutoLoginForm);
