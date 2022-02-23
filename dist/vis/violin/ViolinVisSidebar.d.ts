import * as React from 'react';
import { IViolinConfig, IVisConfig, VisColumn } from '../interfaces';
interface ViolinVisSidebarProps {
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
    width?: string;
}
export declare function ViolinVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width }: ViolinVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=ViolinVisSidebar.d.ts.map