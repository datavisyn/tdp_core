import * as React from 'react';
import { CategoricalColumn, NumericalColumn } from '../interfaces';
import { IVisConfig } from '../interfaces';
import { IPCPConfig } from './utils';
interface PCPVisSidebarProps {
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
    width?: string;
}
export declare function PCPVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width }: PCPVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=PCPVisSidebar.d.ts.map