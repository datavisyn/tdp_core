import * as React from 'react';
import { EFilterOptions, IScatterConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
export declare function ScatterVisSidebar({ config, optionsConfig, extensions, columns, filterCallback, setConfig, }: {
    config: IScatterConfig;
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
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    filterCallback?: (s: EFilterOptions) => void;
    setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps): JSX.Element;
//# sourceMappingURL=ScatterVisSidebar.d.ts.map