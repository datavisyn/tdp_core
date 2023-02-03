import React from 'react';
import { IUserStore } from '../../security';
interface IUserStoreRenderProps<T extends IUserStore = IUserStore> {
    setError(error: string | null): void;
    hasError: boolean;
    store: T;
}
export declare const UserStoreUIMap: Map<string, (props: IUserStoreRenderProps) => React.ReactElement>;
export declare function DefaultLoginForm({ setError, hasError, store }: IUserStoreRenderProps): JSX.Element;
export {};
//# sourceMappingURL=UserStoreUIMap.d.ts.map