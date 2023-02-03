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
export function VisynLoginMenu({ watch = false }) {
    const { appName } = useVisynAppContext();
    const [loggedInAs, setLoggedInAs] = React.useState(null);
    const [show, setShow] = useState(false);
    const [error, setError] = useState(null);
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
    const hasError = error != null && error !== 'not_reachable';
    const isOffline = error === 'not_reachable' || userStoreStatus === 'error';
    return (React.createElement(Modal, { withCloseButton: false, opened: show, onClose: () => null, title: null, "data-testid": "visyn-login-modal" },
        React.createElement(Container, { fluid: true },
            React.createElement(Stack, { mb: "lg" },
                React.createElement(Center, null,
                    React.createElement(Title, { order: 4, truncate: true },
                        i18n.t('tdp:core.visynApp.welcome'),
                        " ",
                        appName)),
                React.createElement(Divider, null))),
        React.createElement(Stack, null,
            isOffline ? (React.createElement(Alert, { icon: React.createElement(FontAwesomeIcon, { icon: faCircleExclamation }), color: "yellow", radius: "md" }, i18n.t('phovea:security_flask.alertOffline'))) : null,
            userStoreStatus === 'pending' ? React.createElement(LoadingOverlay, { visible: true }) : null,
            !userStores || isOffline ? null : userStoresWithUI.length === 0 ? (
            // Use the dummy store as default if no store is found
            React.createElement(DefaultLoginForm, { setError: setError, hasError: hasError, store: { id: 'DummyStore', ui: 'DefaultLoginForm', configuration: {} } })) : (
            // Render all stores next to eachother
            userStoresWithUI.map((store, i, all) => {
                const ToRender = UserStoreUIMap.get(store.ui);
                return (React.createElement(React.Fragment, { key: store.id },
                    ToRender ? (React.createElement(ToRender, { key: store.id, setError: setError, hasError: hasError, store: store })) : (React.createElement(Alert, { color: "yellow", radius: "md" },
                        "No ",
                        store.ui,
                        " found for ",
                        store.id,
                        ". Contact the site administrator if this issue perists.")),
                    ToRender && i !== all.length - 1 ? React.createElement(Divider, { label: "Or", labelPosition: "center" }) : null));
            })))));
}
//# sourceMappingURL=VisynLoginMenu.js.map