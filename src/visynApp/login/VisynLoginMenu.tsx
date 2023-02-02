import React, { useState } from 'react';
import { Alert, Modal, Stack, Title, Text, Center, Divider, Container, LoadingOverlay } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../../app/AppContext';
import { UserSession } from '../../app/UserSession';
import { GlobalEventHandler } from '../../base/event';
import { LoginUtils } from '../../base/LoginUtils';
import { SessionWatcher } from '../../base/watcher';
import { useAsync } from '../../hooks/useAsync';
import { I18nextManager } from '../../i18n/I18nextManager';
import { VisynLoginForm } from './VisynLoginForm';
import { IUserStore } from '../../security';
import { VisynAppContext } from '../VisynAppContext';

interface IUserStoreRenderProps<T extends IUserStore = IUserStore> {
  setError(error: string | null): void;
  hasError: boolean;
  store: T;
}

const { i18n } = I18nextManager.getInstance();

const userStoreMap: Record<string, (props: IUserStoreRenderProps) => React.ReactElement> = {
  DummyStore: ({ setError, hasError, store }) => (
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
  ),
  ALBSecurityStore: ({ setError, store }) => <Text align="justify">{i18n.t('tdp:core.visynApp.securityStores.ALBSecurityStore.message')}</Text>,
};

export function VisynLoginMenu({ watch = false }: { watch?: boolean }) {
  const { appName } = React.useContext(VisynAppContext);
  const [loggedInAs, setLoggedInAs] = React.useState<string>(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string>(null);

  /**
   * auto login if (rememberMe=true)
   */
  const autoLogin = React.useCallback(async () => {
    return new Promise((resolve) => {
      if (!AppContext.getInstance().offline && !loggedInAs) {
        LoginUtils.loggedInAs()
          .then((user) => {
            UserSession.getInstance().login(user);
            resolve(null);
          })
          .catch(() => {
            // ignore not yet logged in
          });
      }
      resolve(null);
    });
  }, [loggedInAs]);

  React.useEffect(() => {
    if (watch) {
      SessionWatcher.startWatching(LoginUtils.logout);
    }
  }, [watch]);

  React.useEffect(() => {
    let forceShowLoginDialogTimeout = null;
    const loginListener = (_, user) => {
      setLoggedInAs(user.name);
      setShow(false);
      clearTimeout(forceShowLoginDialogTimeout);
    };

    const logoutListener = () => {
      setLoggedInAs(null);
      setShow(true);
    };

    GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, loginListener);
    GlobalEventHandler.getInstance().on(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, logoutListener);

    if (!loggedInAs) {
      // wait .5sec before showing the login dialog to give the auto login mechanism a chance
      forceShowLoginDialogTimeout = setTimeout(() => setShow(true), 500);
    }

    return () => {
      GlobalEventHandler.getInstance().off(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, loginListener);
      GlobalEventHandler.getInstance().off(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT, logoutListener);
    };
  }, [loggedInAs]);

  useAsync(autoLogin, []);
  const { value: userStores, error: userStoreError, status: userStoreStatus } = useAsync(LoginUtils.getStores, []);
  const hasError = error != null && error !== 'not_reachable';
  const isOffline = error === 'not_reachable' || userStoreStatus === 'error';

  return (
    <Modal withCloseButton={false} opened={show} onClose={() => null} title={null} data-testid="visyn-login-modal">
      <Container fluid>
        <Stack mb="lg">
          <Center>
            <Title order={4}>
              {i18n.t('tdp:core.visynApp.welcome')} {appName}
            </Title>
          </Center>
          <Divider />
        </Stack>
      </Container>
      <Stack>
        {isOffline ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} title="Warning" color="yellow" radius="md">
            {i18n.t('phovea:security_flask.alertOffline')}
          </Alert>
        ) : null}
        {userStoreStatus === 'pending' ? <LoadingOverlay visible /> : null}
        {!userStores || isOffline ? null : userStores.length === 0 ? (
          // Use the dummy store as default if no store is found
          <userStoreMap.DummyStore setError={setError} hasError={hasError} store={{ id: 'DummyStore', configuration: {} }} />
        ) : (
          // Render all stores next to eachother
          userStores.map((store, i, all) => {
            const ToRender = userStoreMap[store.id];

            return (
              <React.Fragment key={store.id}>
                {
                  ToRender ? <ToRender key={store.id} setError={setError} hasError={hasError} store={store} /> : null
                  // <Alert color="yellow" radius="md">
                  //   No UI found for {store.id}. Contact the site administrator if this issue perists.
                  // </Alert>
                }
                {ToRender && i !== all.length - 1 ? <Divider label="Or" labelPosition="center" /> : null}
              </React.Fragment>
            );
          })
        )}
      </Stack>
    </Modal>
  );
}
