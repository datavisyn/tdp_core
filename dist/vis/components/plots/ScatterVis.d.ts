import * as React from 'react';
import { CategoricalColumn, EFilterOptions, NumericalColumn, Scales } from '../../types/generalTypes';
import { IVisConfig } from '../../types/generalTypes';
import { IScatterConfig } from '../../scatter/scatter';
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
    shapes: string[] | null;
    columns: (NumericalColumn | CategoricalColumn)[];
    filterCallback: (s: EFilterOptions) => void;
    selectionCallback: (s: number[]) => void;
    selected: {
        [key: number]: boolean;
    };
    setConfig: (config: IVisConfig) => void;
    scales: Scales;
}
export declare function ScatterVis({ config, optionsConfig, extensions, columns, shapes, filterCallback, selectionCallback, selected, setConfig, scales }: ScatterVisProps): JSX.Element;
export {};