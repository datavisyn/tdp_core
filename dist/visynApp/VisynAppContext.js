import * as React from 'react';
import { useVisynUser } from './hooks';
export const VisynAppContext = React.createContext(null);
export function VisynAppProvider({ children, appName }) {
    const user = useVisynUser();
    const context = React.useMemo(() => ({
        user,
        appName,
    }), [user, appName]);
    return React.createElement(VisynAppContext.Provider, { value: context }, children);
}
//# sourceMappingURL=VisynAppContext.js.map