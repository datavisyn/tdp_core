import * as React from 'react';
import { IUser } from '../security';
export declare const VisynAppContext: React.Context<{
    user: IUser | null;
    appName: JSX.Element | string;
}>;
export declare function VisynAppProvider({ children, appName }: {
    children?: React.ReactNode;
    appName: JSX.Element | string;
}): JSX.Element;
//# sourceMappingURL=VisynAppContext.d.ts.map