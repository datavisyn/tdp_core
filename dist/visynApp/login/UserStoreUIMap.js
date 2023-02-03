import React from 'react';
import { Text } from '@mantine/core';
import { LoginUtils } from '../../base/LoginUtils';
import { VisynLoginForm } from './VisynLoginForm';
import { I18nextManager } from '../../i18n';
export const UserStoreUIMap = new Map();
export function DefaultLoginForm({ setError, hasError, store }) {
    return (React.createElement(VisynLoginForm, { hasError: hasError, onLogin: async (username, password) => {
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
        } }));
}
UserStoreUIMap.set('DefaultLoginForm', DefaultLoginForm);
UserStoreUIMap.set('AutoLoginForm', ({ setError, store }) => (React.createElement(Text, { align: "justify" }, I18nextManager.getInstance().i18n.t('tdp:core.visynApp.securityStores.ALBSecurityStore.message'))));
//# sourceMappingURL=UserStoreUIMap.js.map