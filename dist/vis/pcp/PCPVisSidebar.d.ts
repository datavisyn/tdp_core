import * as React from 'react';
import { IPCPConfig, IVisConfig, VisColumn } from '../interfaces';
interface PCPVisSidebarProps {
    config: IPCPConfig;
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
export declare function PCPVisSidebar({ config, extensions, columns, setConfig, width }: PCPVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=PCPVisSidebar.d.ts.map