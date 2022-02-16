import * as React from 'react';
import { CategoricalColumn, EFilterOptions, IScatterConfig, NumericalColumn, IVisConfig } from '../interfaces';
interface ScatterVisSidebarProps {
    config: IScatterConfig;
    optionsConfig?: {
        color?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        shape?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        filter?: {
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
    filterCallback?: (s: EFilterOptions) => void;
    setConfig: (config: IVisConfig) => void;
    width?: string;
}
export declare function ScatterVisSidebar({ config, optionsConfig, extensions, columns, filterCallback, setConfig, width, }: ScatterVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=ScatterVisSidebar.d.ts.map