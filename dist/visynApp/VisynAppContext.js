import * as React from 'react';
export const VisynAppContext = React.createContext(null);
export function useVisynAppContext() {
    const context = React.useContext(VisynAppContext);
    if (!context) {
        throw Error('VisynApp can only be used as child of VisynAppProvider.');
    }
    return context;
}
//# sourceMappingURL=VisynAppContext.js.map