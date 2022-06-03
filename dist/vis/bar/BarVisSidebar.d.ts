import * as React from 'react';
import { IBarConfig, ICommonVisSideBarProps } from '../interfaces';
export declare function BarVisSidebar({ config, optionsConfig, columns, setConfig, className, style: { width, ...style }, }: {
    optionsConfig?: {
        group?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        multiples?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        direction?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        groupingType?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        display?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
    };
} & ICommonVisSideBarProps<IBarConfig>): JSX.Element;
//# sourceMappingURL=BarVisSidebar.d.ts.map