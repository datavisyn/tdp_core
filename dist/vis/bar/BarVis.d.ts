import * as React from 'react';
import { Scales, VisColumn, IVisConfig } from '../interfaces';
import { IBarConfig } from './utils';
interface BarVisProps {
    config: IBarConfig;
    optionsConfig?: {
        group?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        multiples?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        direction?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        groupingType?: {
            enable?: boolean;
            customComponent?: React.ReactNode;
        };
        display?: {
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
    scales: Scales;
}
export declare function BarVis({ config, optionsConfig, extensions, columns, setConfig, scales }: BarVisProps): JSX.Element;
export {};
