import * as React from 'react';
import { IStripConfig, IVisConfig, VisColumn, ICommonVisSideBarProps } from '../interfaces';
export declare function StripVisSidebar({ config, extensions, columns, setConfig, }: {
    config: IStripConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps): JSX.Element;
//# sourceMappingURL=StripVisSidebar.d.ts.map