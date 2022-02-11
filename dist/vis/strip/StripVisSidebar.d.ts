import * as React from 'react';
import { CategoricalColumn, IStripConfig, NumericalColumn } from '../interfaces';
import { IVisConfig } from '../interfaces';
interface StripVisSidebarProps {
    config: IStripConfig;
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
export declare function StripVisSidebar({ config, optionsConfig, extensions, columns, setConfig, width }: StripVisSidebarProps): JSX.Element;
export {};
//# sourceMappingURL=StripVisSidebar.d.ts.map