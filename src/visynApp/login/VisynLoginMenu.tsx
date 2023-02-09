import React, { useState } from 'react';
import { Alert, Modal, Stack, Title, Center, Divider, Container, LoadingOverlay } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../../app/AppContext';
import { UserSession } from '../../app/UserSession';
import { GlobalEventHandler } from '../../base/event';
import { LoginUtils } from '../../base/LoginUtils';
import { SessionWatcher } from '../../base/watcher';
import { useAsync } from '../../hooks/useAsync';
import { I18nextManager } from '../../i18n/I18nextManager';
import { useVisynAppContext } from '../VisynAppContext';
import { DefaultLoginForm, UserStoreUIMap } from './UserStoreUIMap';

const { i18n } = I18nextManager.getInstance();

export function VisynLoginMenu({ watch = false }: { watch?: boolean }) {
  const { appName } = useVisynAppContext();
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
  const userStoresWithUI = userStores?.filter((store) => store.ui);
  const hasError = error && error !== 'not_reachable';
  const isOffline = error === 'not_reachable' || userStoreStatus === 'error';

  return (
    <Modal withCloseButton={false} opened={show} onClose={() => null} title={null} data-testid="visyn-login-modal">
      <Container fluid>
        <Stack mb="lg">
          <Center>
            <Title order={4} truncate>
              {i18n.t('tdp:core.visynApp.welcome')} {appName}
            </Title>
          </Center>
          <Divider />
        </Stack>
      </Container>
      <Stack>
        {isOffline ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} color="yellow" radius="md">
            {i18n.t('phovea:security_flask.alertOffline')}
          </Alert>
        ) : null}
        {hasError ? (
          <Alert icon={<FontAwesomeIcon icon={faCircleExclamation} />} color="red" radius="md">
            {error}
          </Alert>
        ) : null}
        {userStoreStatus === 'pending' ? <LoadingOverlay visible /> : null}
        {!userStores || isOffline ? null : userStoresWithUI.length === 0 ? (
          // Use the dummy store as default if no store is found
          <DefaultLoginForm setError={setError} store={{ id: 'DummyStore', ui: 'DefaultLoginForm', configuration: {} }} />
        ) : (
          // Render all stores next to eachother
          userStoresWithUI.map((store, i, all) => {
            const ToRender = UserStoreUIMap.get(store.ui);

            return (
              <React.Fragment key={store.id}>
                {ToRender ? (
                  <ToRender key={store.id} setError={setError} store={store} />
                ) : (
                  <Alert color="yellow" radius="md">
                    No {store.ui} found for {store.id}. Contact the site administrator if this issue perists.
                  </Alert>
                )}
                {ToRender && i !== all.length - 1 ? <Divider label="Or" labelPosition="center" /> : null}
              </React.Fragment>
            );
          })
        )}
      </Stack>
    </Modal>
  );
}
