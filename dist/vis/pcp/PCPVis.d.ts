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
    selected?: {
        [key: string]: boolean;
    };
    hideSidebar?: boolean;
    closeButtonCallback?: () => void;
    showCloseButton?: boolean;
}
export declare function PCPVis({ config, extensions, columns, setConfig, showCloseButton, closeButtonCallback, selected, hideSidebar, }: PCPVisProps): JSX.Element;
export {};
//# sourceMappingURL=PCPVis.d.ts.map