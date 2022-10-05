import { Alert, Modal, Stack, Title, Text, Center, Divider, Container } from '@mantine/core';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { I18nextManager } from '../../i18n/I18nextManager';
import { LoginUtils } from '../../base/LoginUtils';
import { VisynLoginForm } from './VisynLoginForm';
/**
 * Basic login dialog
 */
export function LoginDialog({ show = false, hasWarning, hasError, setError, appName, }) {
    return (React.createElement(Modal, { withCloseButton: false, opened: show, onClose: () => null, title: null },
        React.createElement(Container, { fluid: true },
            React.createElement(Stack, null,
                React.createElement(Center, null,
                    React.createElement(Title, { order: 4 },
                        " ",
                        I18nextManager.getInstance().i18n.t('tdp:core.visynApp.welcome', { appName }))),
                React.createElement(Divider, null),
                React.createElement(Center, null,
                    React.createElement(Text, { mb: "lg" },
                        " ",
                        I18nextManager.getInstance().i18n.t('tdp:core.visynApp.login'))))),
        React.createElement(Stack, null,
            hasError ? (React.createElement(Alert, { icon: React.createElement(FontAwesomeIcon, { icon: faCircleExclamation }), title: "Error", color: "red", radius: "md" }, I18nextManager.getInstance().i18n.t('phovea:security_flask.alertWrongCredentials'))) : null,
            hasWarning ? (React.createElement(Alert, { icon: React.createElement(FontAwesomeIcon, { icon: faCircleExclamation }), title: "Warning", color: "yellow", radius: "md" }, I18nextManager.getInstance().i18n.t('phovea:security_flask.alertOffline'))) : null,
            React.createElement(VisynLoginForm, { onLogin: async (username, password) => {
                    setError(null);
                    return LoginUtils.login(username, password).catch((e) => {
                        if (e.response && e.response.status !== 401) {
                            // 401 = Unauthorized
                            // server error
                            setError('not_reachable');
                        }
                        else {
                            setError(e);
                        }
                    });
                } }))));
}
//# sourceMappingURL=LoginDialog.js.map