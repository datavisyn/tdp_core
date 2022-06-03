import * as React from 'react';
import { IScatterConfig, ICommonVisSideBarProps } from '../interfaces';
export declare function ScatterVisSidebar({ config, optionsConfig, columns, filterCallback, setConfig, className, style: { width, ...style }, }: {
    optionsConfig?: {
        color?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        shape?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        filter?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
    };
} & ICommonVisSideBarProps<IScatterConfig>): JSX.Element;
//# sourceMappingURL=ScatterVisSidebar.d.ts.map