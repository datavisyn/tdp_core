import React, { useState } from 'react';
import { AppContext } from '../../app/AppContext';
import { UserSession } from '../../app/UserSession';
import { GlobalEventHandler } from '../../base/event';
import { LoginUtils } from '../../base/LoginUtils';
import { SessionWatcher } from '../../base/watcher';
import { useAsync } from '../../hooks/useAsync';
import { LoginDialog } from './LoginDialog';
export function VisynLoginMenu({ watch = false, appName }) {
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
    return (React.createElement(LoginDialog, { appName: appName, show: show, hasWarning: error === 'not_reachable', setError: (s) => setError(s), hasError: error != null && error !== 'not_reachable' }));
}
//# sourceMappingURL=LoginMenu.js.map