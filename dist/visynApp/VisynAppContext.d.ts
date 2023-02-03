import * as React from 'react';
import type { ITDPClientConfig } from '../base/clientConfig';
import type { IUser } from '../security';
export declare const VisynAppContext: React.Context<{
    user: IUser | null;
    appName: JSX.Element | string;
    clientConfig: ITDPClientConfig;
}>;
export declare function useVisynAppContext(): {
    user: IUser;
    appName: string | JSX.Element;
    clientConfig: ITDPClientConfig;
};
//# sourceMappingURL=VisynAppContext.d.ts.map