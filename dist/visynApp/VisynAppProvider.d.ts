import * as React from 'react';
import { ITDPClientConfig } from '../base/clientConfig';
export declare function VisynAppProvider({ children, appName, defaultClientConfig, }: {
    children?: React.ReactNode;
    appName: JSX.Element | string;
    /**
     * Client configuration which is automatically populated by the '/clientConfig.json' on initialize.
     * To enable the asynchronous loading of the client configuration, pass an object (optionally with default values).
     * Passing falsy values disables the client configuration load.
     */
    defaultClientConfig?: ITDPClientConfig | null | undefined;
}): JSX.Element;
//# sourceMappingURL=VisynAppProvider.d.ts.map