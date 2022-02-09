import * as React from 'react';
import { CategoricalColumn, IPCPConfig, IVisConfig, NumericalColumn } from '..';
interface PCPVisProps {
    config: IPCPConfig;
    optionsConfig?: {};
    extensions?: {
        prePlot?: React.ReactNode;
        postPlot?: React.ReactNode;
        preSidebar?: React.ReactNode;
        postSidebar?: React.ReactNode;
    };
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    hideSidebar?: boolean;
}
export declare function PCPVis({ config, optionsConfig, extensions, columns, setConfig, hideSidebar }: PCPVisProps): JSX.Element;
export {};
//# sourceMappingURL=PCPVis.d.ts.map