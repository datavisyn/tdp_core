import * as React from 'react';
import { IVisConfig, EFilterOptions, Scales, VisColumn, IScatterConfig } from '../interfaces';
interface ScatterVisProps {
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
    shapes?: string[];
    columns: VisColumn[];
    filterCallback?: (s: EFilterOptions) => void;
    selectionCallback?: (s: number[]) => void;
    selected?: {
        [key: number]: boolean;
    };
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function ScatterVis({ config, optionsConfig, extensions, columns, shapes, filterCallback, selectionCallback, selected, setConfig, scales, }: ScatterVisProps): JSX.Element;
export {};
//# sourceMappingURL=ScatterVis.d.ts.map