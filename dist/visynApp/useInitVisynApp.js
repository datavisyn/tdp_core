import React from 'react';
import { useAsync } from '../hooks/useAsync';
import { I18nextManager } from '../i18n/I18nextManager';
export function useInitVisynApp() {
    const initI18n = React.useMemo(() => () => {
        return I18nextManager.getInstance().initI18n();
    }, []);
    return useAsync(initI18n, []);
}
//# sourceMappingURL=useInitVisynApp.js.map