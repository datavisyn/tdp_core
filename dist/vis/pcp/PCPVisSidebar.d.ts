import * as React from 'react';
import { IPCPConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
export declare function PCPVisSidebar({ config, extensions, columns, setConfig, className, style: { width, ...style }, }: {
    config: IPCPConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps): JSX.Element;
//# sourceMappingURL=PCPVisSidebar.d.ts.map