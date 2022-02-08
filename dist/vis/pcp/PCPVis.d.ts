import * as React from 'react';
import { VisColumn, IVisConfig, IPCPConfig } from '../interfaces';
interface PCPVisProps {
    config: IPCPConfig;
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: VisColumn[];
    setConfig: (config: IVisConfig) => void;
}
export declare function PCPVis({ config, extensions, columns, setConfig }: PCPVisProps): JSX.Element;
export {};
//# sourceMappingURL=PCPVis.d.ts.map