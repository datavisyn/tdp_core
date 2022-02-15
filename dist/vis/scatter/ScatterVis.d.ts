import * as React from 'react';
import { IVisConfig, EFilterOptions, Scales, VisColumn, IScatterConfig } from '../interfaces';
export declare function ScatterVis({ config, optionsConfig, extensions, columns, shapes, filterCallback, selectionCallback, selected, setConfig, scales, }: {
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
    selectionCallback?: (s: string[]) => void;
    selected?: {
        [id: string]: boolean;
    };
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}): JSX.Element;
//# sourceMappingURL=ScatterVis.d.ts.map