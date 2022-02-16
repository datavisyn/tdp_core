import * as React from 'react';
import { IStripConfig, IVisConfig, VisColumn } from '../interfaces';
interface StripVisSidebarProps {
    config: IStripConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
    width?: string;
}
export declare function StripVisSidebar({ config, extensions, columns, setConfig, width }: StripVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=StripVisSidebar.d.ts.map