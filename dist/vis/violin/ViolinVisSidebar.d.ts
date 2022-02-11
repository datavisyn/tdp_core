import * as React from 'react';
import { CategoricalColumn, IViolinConfig, NumericalColumn } from '../interfaces';
import { IVisConfig } from '../interfaces';
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
    columns: (NumericalColumn | CategoricalColumn)[];
    setConfig: (config: IVisConfig) => void;
    width?: string;
}
export declare function ViolinVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width }: ViolinVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=ViolinVisSidebar.d.ts.map