import * as React from 'react';
import { IViolinConfig, ICommonVisSideBarProps } from '../interfaces';
export declare function ViolinVisSidebar({ config, optionsConfig, columns, setConfig, className, style: { width, ...style }, }: {
    optionsConfig?: {
        overlay?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
    };
} & ICommonVisSideBarProps<IViolinConfig>): JSX.Element;
//# sourceMappingURL=ViolinVisSidebar.d.ts.map