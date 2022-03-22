import * as React from 'react';
import { IViolinConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
export declare function ViolinVisSidebar({ config, optionsConfig, extensions, columns, setConfig, className, style: { width, ...style }, }: {
    config: IViolinConfig;
    optionsConfig?: {
        overlay?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
    };
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps): JSX.Element;
//# sourceMappingURL=ViolinVisSidebar.d.ts.map