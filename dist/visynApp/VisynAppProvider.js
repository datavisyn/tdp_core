import { merge } from 'lodash';
import * as React from 'react';
import { loadClientConfig } from '../base/clientConfig';
import { useAsync } from '../hooks';
import { useInitVisynApp, useVisynUser } from './hooks';
import { VisynAppContext } from './VisynAppContext';
export function VisynAppProvider({ children, appName, defaultClientConfig, }) {
    const user = useVisynUser();
    const { status: initStatus } = useInitVisynApp();
    const parseClientConfig = React.useCallback(async () => {
        if (!defaultClientConfig) {
            return {};
        }
        const remoteClientConfig = await loadClientConfig();
        return merge(defaultClientConfig || {}, remoteClientConfig || {});
    }, [defaultClientConfig]);
    const { value: clientConfig, status: clientConfigStatus } = useAsync(parseClientConfig, []);
    const context = React.useMemo(() => ({
        user,
        appName,
        clientConfig,
    }), [user, appName, clientConfig]);
    return React.createElement(VisynAppContext.Provider, { value: context }, initStatus === 'success' && clientConfigStatus === 'success' ? children : null);
}
//# sourceMappingURL=VisynAppProvider.js.map